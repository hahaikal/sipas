export const cleanText = (text: string): string => {
  return text.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
};

export const convertToDate = (dateString: string): string | null => {
  if (!dateString || typeof dateString !== 'string') return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  const months: { [key: string]: string } = {
    'januari': '01', 'februari': '02', 'maret': '03', 'april': '04', 'mei': '05', 'juni': '06',
    'juli': '07', 'agustus': '08', 'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
  };

  const parts = dateString.toLowerCase().split(' ');
  
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const monthNumber = months[month];
    if (monthNumber && !isNaN(parseInt(day)) && !isNaN(parseInt(year))) {
      return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
    }
  }
  return null;
};