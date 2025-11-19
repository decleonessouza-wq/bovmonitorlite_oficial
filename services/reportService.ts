import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generatePDF = async (elementId: string, fileName: string): Promise<File | null> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  try {
    // Captura o elemento como Canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Melhora a resolução
      backgroundColor: '#020617', // Garante fundo escuro (slate-950) no PDF
      useCORS: true, // Permite carregar imagens externas se configurado corretamente
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Configura o PDF (A4, Retrato ou Paisagem dependendo da proporção)
    const orientation = canvas.width > canvas.height ? 'l' : 'p';
    const pdf = new jsPDF(orientation, 'mm', 'a4');
    
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Retorna o Blob do PDF como um arquivo
    const pdfBlob = pdf.output('blob');
    return new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });

  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};

export const downloadPDF = (file: File) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const sharePDF = async (file: File, title: string, text: string): Promise<boolean> => {
  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: title,
        text: text,
        files: [file],
      });
      return true;
    } catch (error) {
      console.error("Error sharing:", error);
      return false;
    }
  } else {
    // Fallback se não suportar compartilhamento nativo
    downloadPDF(file);
    return false;
  }
};