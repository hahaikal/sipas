import fs from 'fs';
import pdf from 'pdf-parse';

interface ExtractedData {
  nomorSurat: string | null;
  tanggalSurat: string | null;
  judul: string | null;
}

const cleanText = (text: string): string => {
  return text.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
};

export const convertToDate = (dateString: string): string | null => {
  const months: { [key: string]: string } = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04', 'mei': '05', 'juni': '06',
    'juli': '07', 'agustus': '08', 'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
  };
  const parts = dateString.toLowerCase().split(' ');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const monthNumber = months[month];
    if (monthNumber) {
      return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
    }
  }
  return null;
};

export const extractDataFromPdf = async (filePath: string): Promise<ExtractedData> => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const text = data.text;

  let extracted: ExtractedData = {
    nomorSurat: null,
    tanggalSurat: null,
    judul: null,
  };

  // Contoh Regex
  const nomorMatch = text.match(/Nomor\s*:\s*([^\s]+)/i);
  if (nomorMatch && nomorMatch[1]) {
    extracted.nomorSurat = cleanText(nomorMatch[1]);
  }

  const tanggalMatch = text.match(/Bagan Batu Kota,\s*(\d{1,2}\s+\w+\s+\d{4})/i);
  if (tanggalMatch && tanggalMatch[1]) {
    const formattedDate = convertToDate(cleanText(tanggalMatch[1]));
    if(formattedDate) {
        extracted.tanggalSurat = formattedDate;
    }
  }

  const judulMatch = text.match(/TENTANG\n\s*([\s\S]*?)(?=\n\n\w)/i);
  if (judulMatch && judulMatch[1]) {
    extracted.judul = cleanText(judulMatch[1].replace(/\n/g, ' '));
  }

  if (!extracted.nomorSurat || !extracted.tanggalSurat || !extracted.judul) {
    throw new Error('Gagal mengekstrak data penting (Nomor, Tanggal, atau Judul) dari PDF.');
  }

  return extracted;
};