import PDFDocument from 'pdfkit';

export const generatePdf = async (note) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);
  doc.fontSize(22).text('ALBARÁN DE TRABAJO', { align: 'center' }).moveDown();
  doc.fontSize(11)
    .text(`Empresa: ${note.company?.name || ''}`)
    .text(`Cliente: ${note.client?.name || ''} (${note.client?.cif || ''})`)
    .text(`Proyecto: ${note.project?.name || ''}`)
    .text(`Fecha: ${new Date(note.workDate).toLocaleDateString('es-ES')}`)
    .text(`Creado por: ${note.user?.fullName || note.user?.email || ''}`)
    .moveDown()
    .fontSize(14).text(note.description).moveDown();
  if (note.format === 'material') {
    doc.fontSize(11).text(`Material: ${note.material}`)
      .text(`Cantidad: ${note.quantity} ${note.unit}`);
  } else {
    if (note.hours) doc.fontSize(11).text(`Horas: ${note.hours}`);
    for (const worker of note.workers || []) doc.text(`${worker.name}: ${worker.hours} horas`);
  }
  doc.moveDown().text(note.signed
    ? `Firmado el ${new Date(note.signedAt).toLocaleString('es-ES')}. Firma: ${note.signatureUrl}`
    : 'Pendiente de firma');
  doc.end();
});
