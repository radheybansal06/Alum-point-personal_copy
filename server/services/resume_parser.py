import io  # type: ignore
import os  # type: ignore
from abc import ABC, abstractmethod  # type: ignore

# Try to import magic, but make it optional for Windows compatibility
try:
    import magic  # type: ignore
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    # Redirect warning to stderr instead of stdout to avoid JSON parsing issues
    import sys
    print("Warning: python-magic not available. File type detection will use file extensions.", file=sys.stderr)

# --- Import parsing libraries ---
# Ensure you have installed all required libraries:
# pip install PyMuPDF python-docx odfpy beautifulsoup4 Pillow pytesseract python-magic
import fitz  # type: ignore
from odf.opendocument import load as load_odt  # type: ignore
from odf.text import P as OdtP  # type: ignore
from odf import teletype as OdtTeletype  # type: ignore
from bs4 import BeautifulSoup  # type: ignore
from PIL import Image  # type: ignore
import pytesseract  # type: ignore
from docx import Document
from docx.document import Document as DocumentObject
from docx.table import _Cell, Table
from docx.text.paragraph import Paragraph

class ParsingError(Exception):
    """Custom exception for parsing failures."""
    pass

# --- Strategy Interface and Concrete Implementations ---

class ParserStrategy(ABC):
    """
    The Strategy interface declares operations common to all supported parsing versions.
    """
    @abstractmethod
    def parse(self, file_bytes: bytes) -> str:
        pass

class PdfParser(ParserStrategy):
    def parse(self, file_bytes: bytes) -> str:
        try:
            pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
            text = "".join(page.get_text() for page in pdf_document)  # type: ignore
            pdf_document.close()
            return text
        except Exception as e:
            raise ParsingError(f"Failed to parse PDF: {e}")

class DocxParser(ParserStrategy):
    """
    An improved DOCX parser that handles both paragraphs and tables,
    ensuring all content from the document is extracted in order.
    """
    def parse(self, file_bytes: bytes) -> str:
        try:
            document = Document(io.BytesIO(file_bytes))
            full_text = []

            # Iterate through all elements in the document body
            for block in self._iter_block_items(document):
                if isinstance(block, Paragraph):
                    full_text.append(block.text)
                elif isinstance(block, Table):
                    # For tables, iterate through rows and cells
                    for row in block.rows:
                        row_text = "\t".join(cell.text for cell in row.cells)
                        full_text.append(row_text)
            
            return "\n".join(full_text)
        except Exception as e:
            raise ParsingError(f"Failed to parse DOCX: {e}")

    def _iter_block_items(self, parent):
        """
        A generator to yield each paragraph and table child within a document,
        in document order.
        """
        from docx.oxml.table import CT_Tbl
        from docx.oxml.text.paragraph import CT_P
        from docx.document import Document as DocumentType

        if isinstance(parent, DocumentType):
            parent_elm = parent._element.body
        elif isinstance(parent, _Cell):
            parent_elm = parent._tc
        else:
            raise ValueError("Unsupported parent type")

        for child in parent_elm.iterchildren():
            if isinstance(child, CT_P):
                yield Paragraph(child, parent)
            elif isinstance(child, CT_Tbl):
                yield Table(child, parent)

class OdtParser(ParserStrategy):
    """
    Corrected ODT parser using odfpy.
    This version recursively extracts text from all elements to avoid including XML tags.
    """
    def parse(self, file_bytes: bytes) -> str:
        try:
            doc = load_odt(io.BytesIO(file_bytes))
            text_chunks = []
            paragraphs = doc.getElementsByType(OdtP)
            for para in paragraphs:
                text_chunks.append(OdtTeletype.extractText(para))
            return '\n'.join(text_chunks)
        except Exception as e:
            raise ParsingError(f"Failed to parse ODT: {e}")
            
class HtmlParser(ParserStrategy):
    def parse(self, file_bytes: bytes) -> str:
        try:
            soup = BeautifulSoup(file_bytes, 'html.parser')
            for script_or_style in soup(["script", "style"]):
                script_or_style.decompose()
            return soup.get_text(separator='\n', strip=True)
        except Exception as e:
            raise ParsingError(f"Failed to parse HTML: {e}")

class OcrParser(ParserStrategy):
    def parse(self, file_bytes: bytes) -> str:
        try:
            image = Image.open(io.BytesIO(file_bytes))
            return pytesseract.image_to_string(image)
        except Exception as e:
            raise ParsingError(f"Failed to perform OCR on image: {e}")

class TxtParser(ParserStrategy):
    def parse(self, file_bytes: bytes) -> str:
        try:
            return file_bytes.decode('utf-8', errors='replace')
        except Exception as e:
            raise ParsingError(f"Failed to parse TXT: {e}")

# --- Main Parser Class (The "Context") ---

class ResumeParser:
    def __init__(self):
        self._strategies = {
            'application/pdf': PdfParser(),
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': DocxParser(),
            'application/vnd.oasis.opendocument.text': OdtParser(),
            'text/html': HtmlParser(),
            'image/jpeg': OcrParser(),
            'image/png': OcrParser(),
            'image/tiff': OcrParser(),
            'image/bmp': OcrParser(),
            'text/plain': TxtParser(),
        }

    def register_strategy(self, mime_type: str, strategy: ParserStrategy):
        """Allows adding new strategies at runtime."""
        self._strategies[mime_type] = strategy

    def parse(self, file_input) -> str:
        """
        Parses a resume file, detecting its type and using the appropriate strategy.
        :param file_input: Can be a file path (str) or file content (bytes).
        :return: Extracted text as a string.
        """
        if isinstance(file_input, str) and os.path.exists(file_input):
            with open(file_input, 'rb') as f:
                file_bytes = f.read()
        elif isinstance(file_input, bytes):
            file_bytes = file_input
        else:
            raise ValueError("Input must be a valid file path or a bytes object.")

        if MAGIC_AVAILABLE:
            mime_type = magic.from_buffer(file_bytes, mime=True)
        else:
            # Fallback to file extension detection
            if isinstance(file_input, str):
                file_ext = os.path.splitext(file_input)[1].lower()
                mime_type = self._get_mime_from_extension(file_ext)
            else:
                # For bytes input without file path, try to detect from content
                mime_type = self._detect_mime_from_content(file_bytes)
        
        strategy = self._strategies.get(mime_type)

        if not strategy:
            if mime_type.startswith('text/'):
                strategy = self._strategies['text/plain']
            else:
                raise NotImplementedError(f"No parser available for MIME type: {mime_type}")
        
        # Log to stderr to avoid interfering with JSON output
        import sys
        print(f"Detected MIME type: {mime_type}. Using {strategy.__class__.__name__}.", file=sys.stderr)
        return strategy.parse(file_bytes)

    def _get_mime_from_extension(self, file_ext):
        """Get MIME type from file extension."""
        mime_map = {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.doc': 'application/msword',
            '.odt': 'application/vnd.oasis.opendocument.text',
            '.html': 'text/html',
            '.htm': 'text/html',
            '.txt': 'text/plain',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.tiff': 'image/tiff',
            '.bmp': 'image/bmp'
        }
        return mime_map.get(file_ext, 'application/octet-stream')

    def _detect_mime_from_content(self, file_bytes):
        """Detect MIME type from file content when magic is not available."""
        # Check for PDF signature
        if file_bytes.startswith(b'%PDF'):
            return 'application/pdf'
        # Check for DOCX signature (ZIP-based)
        elif file_bytes.startswith(b'PK\x03\x04'):
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        # Check for HTML
        elif file_bytes.startswith(b'<html') or file_bytes.startswith(b'<!DOCTYPE'):
            return 'text/html'
        # Check for image signatures
        elif file_bytes.startswith(b'\x89PNG'):
            return 'image/png'
        elif file_bytes.startswith(b'\xff\xd8\xff'):
            return 'image/jpeg'
        elif file_bytes.startswith(b'II*\x00') or file_bytes.startswith(b'MM\x00*'):
            return 'image/tiff'
        elif file_bytes.startswith(b'BM'):
            return 'image/bmp'
        # Default to text/plain for other content
        else:
            return 'text/plain'

# --- Usage Example ---
if __name__ == '__main__':
    parser = ResumeParser()
    print(parser.parse("Rajesh_Jha_ATS_Resume_UPDATED.docx"))
