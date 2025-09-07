const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Sample data with merchants and design numbers
const sampleData = [
  { merchant: 'ASPIRE', designNo: '246' },
  { merchant: 'ASPIRE', designNo: '4919' },
  { merchant: 'ASPIRE', designNo: '983' },
  { merchant: 'ASPIRE', designNo: 'ASP001' },
  { merchant: 'ASPIRE', designNo: 'H21733' },
  { merchant: 'BLEZZA TROVIN', designNo: 'RW-407' },
  { merchant: 'CELEBRITY', designNo: '42190' },
  { merchant: 'CELEBRITY', designNo: '4220' },
  { merchant: 'CELEBRITY', designNo: '5270' },
  { merchant: 'CELEBRITY', designNo: '5271' },
  { merchant: 'CELEBRITY', designNo: '5278' },
  { merchant: 'CELEBRITY', designNo: '5279' },
  { merchant: 'CELEBRITY', designNo: '5280' },
  { merchant: 'CELEBRITY', designNo: 'H21725' },
  { merchant: 'COT LYCRA', designNo: 'P-1002' },
  { merchant: 'COTTON KING', designNo: 'P-1001' },
  { merchant: 'COTTON KING', designNo: 'P1001' },
  { merchant: 'FRONX', designNo: 'AL-347' },
  { merchant: 'HALL MARK', designNo: '1601' },
  { merchant: 'HALL MARK', designNo: '1602' },
  { merchant: 'HALL MARK', designNo: '11375' },
  { merchant: 'HALL MARK', designNo: '13948' },
  { merchant: 'HALL MARK', designNo: '16001' },
  { merchant: 'HALL MARK', designNo: '1601' },
  { merchant: 'HALL MARK', designNo: '424' },
  { merchant: 'HALL MARK', designNo: '4589' },
  { merchant: 'HALL MARK', designNo: '4590' },
  { merchant: 'HALL MARK', designNo: 'HM-001' },
  { merchant: 'HALL MARK', designNo: 'HM-002' },
  { merchant: 'HALL MARK', designNo: 'HM-005' },
  { merchant: 'ICON', designNo: '2780' },
  { merchant: 'ICON', designNo: '4592' },
  { merchant: 'ICON', designNo: '5290' },
  { merchant: 'ICON', designNo: '9951' },
  { merchant: 'ICON', designNo: '9953' },
  { merchant: 'KINGSTONE', designNo: '1961' },
  { merchant: 'KINGSTONE', designNo: '1962' },
  { merchant: 'KINGSTONE', designNo: '1962B' },
  { merchant: 'KINGSTONE', designNo: '2339' },
  { merchant: 'KINGSTONE', designNo: '4153' },
  { merchant: 'KINGSTONE', designNo: '4156' },
  { merchant: 'KINGSTONE', designNo: '4158' },
  { merchant: 'KINGSTONE', designNo: 'UFM002' },
  { merchant: 'KINLEY', designNo: '25' },
  { merchant: 'KINLEY', designNo: '15883' },
  { merchant: 'KINLEY', designNo: '2042' },
  { merchant: 'KINLEY', designNo: '240' },
  { merchant: 'KINLEY', designNo: '9907' },
  { merchant: 'KINLEY', designNo: 'H17613' },
  { merchant: 'KINLEY', designNo: 'H17945' },
  { merchant: 'KINLEY', designNo: 'H18416' },
  { merchant: 'KINLEY', designNo: 'H18926' },
  { merchant: 'MARINO', designNo: '15758' },
  { merchant: 'MARINO', designNo: '11077' },
  { merchant: 'MARINO', designNo: '13450' },
  { merchant: 'MARINO', designNo: '14190' },
  { merchant: 'MARINO', designNo: '15753' },
  { merchant: 'MARINO', designNo: '15888' },
  { merchant: 'MARINO', designNo: '19675' },
  { merchant: 'MARINO', designNo: '9902' },
  { merchant: 'MARINO', designNo: 'AL429A' },
  { merchant: 'MARINO', designNo: 'H12991' },
  { merchant: 'MARINO', designNo: 'H19340' },
  { merchant: 'MARINO', designNo: 'H21298' },
  { merchant: 'MARINO', designNo: 'MN-002' },
  { merchant: 'MARINO', designNo: 'MN-003' },
  { merchant: 'MARINO', designNo: 'MN-004' },
  { merchant: 'MARINO', designNo: 'MN-005' },
  { merchant: 'MARINO', designNo: 'MN-007' },
  { merchant: 'MARINO', designNo: 'MN-008' },
  { merchant: 'MARINO', designNo: 'MN-009' },
  { merchant: 'MARINO', designNo: 'MN-010' },
  { merchant: 'MARINO', designNo: 'MN-011' },
  { merchant: 'MARINO', designNo: 'MN-012' },
  { merchant: 'MARINO', designNo: 'MN-013' },
  { merchant: 'MARINO', designNo: 'MN-014' },
  { merchant: 'MARINO', designNo: 'MN-015' },
  { merchant: 'MARINO', designNo: 'VL4057' },
  { merchant: 'STARLET', designNo: '639' },
  { merchant: 'STARLET', designNo: '6472' },
  { merchant: 'STARLET', designNo: '7170' },
  { merchant: 'STARLET', designNo: '978' },
  { merchant: 'STARLET', designNo: 'LF-004' },
  { merchant: 'STARLET', designNo: 'LF-009' },
  { merchant: 'STARLET', designNo: 'LF-010' },
  { merchant: 'STARLET', designNo: 'LF-011' },
  { merchant: 'STARLET', designNo: 'LF-012' },
  { merchant: 'STARLET', designNo: 'LF-013' },
  { merchant: 'STARLET', designNo: 'LF-014' },
  { merchant: 'STARLET', designNo: 'LF-015' },
  { merchant: 'STARLET', designNo: 'LF-016' },
  { merchant: 'ULTIMA', designNo: '3048' },
  { merchant: 'ULTIMA', designNo: '637' },
  { merchant: 'ULTIMA', designNo: '1866' },
  { merchant: 'ULTIMA', designNo: '1867' },
  { merchant: 'ULTIMA', designNo: '1868' },
  { merchant: 'ULTIMA', designNo: '2316' },
  { merchant: 'ULTIMA', designNo: '3022' },
  { merchant: 'ULTIMA', designNo: '3032' },
  { merchant: 'ULTIMA', designNo: '3046' },
  { merchant: 'ULTIMA', designNo: '3047' },
  { merchant: 'ULTIMA', designNo: '3066' },
  { merchant: 'ULTIMA', designNo: '52891' },
  { merchant: 'ULTIMA', designNo: '52892' },
  { merchant: 'ULTIMA', designNo: '556' },
  { merchant: 'ULTIMA', designNo: '5571' },
  { merchant: 'ULTIMA', designNo: '560' },
  { merchant: 'ULTIMA', designNo: '638' },
  { merchant: 'ULTIMA', designNo: 'UM-001' },
  { merchant: 'ADALE', designNo: '11269' },
  { merchant: 'ADALE', designNo: '13825' },
  { merchant: 'ADALE', designNo: '15079' },
  { merchant: 'ADALE', designNo: '16042' },
  { merchant: 'EMPIRE', designNo: '4' },
  { merchant: 'EMPIRE', designNo: '11274' },
  { merchant: 'EMPIRE', designNo: '1217' },
  { merchant: 'EMPIRE', designNo: '12745' },
  { merchant: 'EMPIRE', designNo: '12746' },
  { merchant: 'EMPIRE', designNo: '12747' },
  { merchant: 'EMPIRE', designNo: '12749' },
  { merchant: 'EMPIRE', designNo: '19659' },
  { merchant: 'EMPIRE', designNo: '29' },
  { merchant: 'EMPIRE', designNo: '7168' },
  { merchant: 'EMPIRE', designNo: '9220' },
  { merchant: 'EMPIRE', designNo: 'H17694' },
  { merchant: 'EMPIRE', designNo: 'H17754' },
  { merchant: 'EMPIRE', designNo: 'H17946' },
  { merchant: 'EMPIRE', designNo: 'H18513' },
  { merchant: 'EMPIRE', designNo: 'H1972' },
  { merchant: 'FESTINA', designNo: '11275' },
  { merchant: 'FESTINA', designNo: '30' },
  { merchant: 'FESTINA', designNo: '57' },
  { merchant: 'FESTINA', designNo: '11275' },
  { merchant: 'FESTINA', designNo: '11276' },
  { merchant: 'FESTINA', designNo: '12174' },
  { merchant: 'FESTINA', designNo: '13776B' },
  { merchant: 'FESTINA', designNo: '18150' },
  { merchant: 'FESTINA', designNo: '19121' },
  { merchant: 'FESTINA', designNo: '19137' },
  { merchant: 'FESTINA', designNo: '19218' },
  { merchant: 'FESTINA', designNo: '19658' },
  { merchant: 'FESTINA', designNo: '19658B' },
  { merchant: 'FESTINA', designNo: '31' },
  { merchant: 'FESTINA', designNo: '334' },
  { merchant: 'FESTINA', designNo: '34' },
  { merchant: 'FESTINA', designNo: '984' },
  { merchant: 'FESTINA', designNo: 'AL-335' },
  { merchant: 'FESTINA', designNo: 'H19364' },
  { merchant: 'FREEMAN', designNo: 'H21788' },
  { merchant: 'GOLD COIN', designNo: '233' },
  { merchant: 'GOLD COIN', designNo: '9897' },
  { merchant: 'GOLD COIN', designNo: '10054' },
  { merchant: 'GOLD COIN', designNo: '9896' },
  { merchant: 'GOLD COIN', designNo: '9905' },
  { merchant: 'GOLD COIN', designNo: 'AL-171' },
  { merchant: 'GOLD COIN', designNo: 'H17696' },
  { merchant: 'HUDSON BLK', designNo: 'HB-001' },
  { merchant: 'HUDSON BLK', designNo: 'HB-002' },
  { merchant: 'HUDSON BLK', designNo: 'HB-003' },
  { merchant: 'HYPER', designNo: '14119' },
  { merchant: 'HYPER', designNo: 'H19151' },
  { merchant: 'HYPER', designNo: 'H19480' },
  { merchant: 'HYPER', designNo: 'H19497' },
  { merchant: 'ITALICA', designNo: '16' },
  { merchant: 'ITALICA', designNo: '237' },
  { merchant: 'ITALICA', designNo: '1014' },
  { merchant: 'KING WEAR', designNo: '18' },
  { merchant: 'KING WEAR', designNo: '36' },
  { merchant: 'KING WEAR', designNo: '1397A' },
  { merchant: 'KING WEAR', designNo: '1397B' },
  { merchant: 'KING WEAR', designNo: '4056' },
  { merchant: 'KING WEAR', designNo: 'H17517' },
  { merchant: 'LEGACY', designNo: 'AL-483' },
  { merchant: 'LOGAN', designNo: 'LOG001' },
  { merchant: 'LORENZO', designNo: 'AL-347' },
  { merchant: 'OASTER', designNo: '11288' },
  { merchant: 'ORBIT', designNo: '17284' },
  { merchant: 'ORBIT', designNo: '20042' },
  { merchant: 'RANGER', designNo: 'H15079' },
  { merchant: 'WALL MART', designNo: '14120' },
  { merchant: 'WALL MART', designNo: '11252' },
  { merchant: 'WALL MART', designNo: '14120' },
  { merchant: 'WALL MART', designNo: '19717' },
  { merchant: 'WALL MART', designNo: '3979' },
  { merchant: 'WALL MART', designNo: '6816' },
  { merchant: 'WALL MART', designNo: '7016' },
  { merchant: 'WALL MART', designNo: '7017' },
  { merchant: 'WALL MART', designNo: '7172' },
  { merchant: 'WALL MART', designNo: '7575' },
  { merchant: 'WALL MART', designNo: '9450' },
  { merchant: 'WALL MART', designNo: 'D-7020' },
  { merchant: 'ALLEN SOLLY', designNo: '17543' },
  { merchant: 'ALLEN SOLLY', designNo: '3048' },
  { merchant: 'ALLEN SOLLY', designNo: '4041' },
  { merchant: 'ALLEN SOLLY', designNo: '469' },
  { merchant: 'ALLEN SOLLY', designNo: '7040' },
  { merchant: 'EMBASSY', designNo: '19586' },
  { merchant: 'EMBASSY', designNo: '947' },
  { merchant: 'ITALICA+', designNo: '5639' },
  { merchant: 'ITALICA+', designNo: 'H12685' },
  { merchant: 'PLEASURE', designNo: '37' },
  { merchant: 'RICHMOND', designNo: '23051' },
  { merchant: 'RICHMOND', designNo: '3539' },
  { merchant: 'RICHMOND', designNo: 'AL-197' },
  { merchant: 'RICHMOND', designNo: 'D-3196' },
  { merchant: 'RICHMOND', designNo: 'VL1291' },
  { merchant: 'RICHMOND', designNo: 'VL1292' },
  { merchant: 'ROMANO', designNo: 'AL-649' },
  { merchant: 'ROMANO', designNo: 'AL649C' },
  { merchant: 'ROMANO', designNo: 'ROMN01' },
  { merchant: 'ROMERO', designNo: 'H21354' },
  { merchant: 'ROMY', designNo: '23' },
  { merchant: 'ROMY', designNo: '23' },
  { merchant: 'ROMY', designNo: '26' },
  { merchant: 'ROMY', designNo: '66' },
  { merchant: 'ROMY', designNo: '760' },
  { merchant: 'ROMY', designNo: '16586' },
  { merchant: 'ROMY', designNo: '19588' },
  { merchant: 'ROMY', designNo: '760' },
  { merchant: 'ROMY', designNo: 'A12714' },
  { merchant: 'ROMY', designNo: 'AL-129' },
  { merchant: 'ROMY', designNo: 'AL-143' },
  { merchant: 'ROMY', designNo: 'AL-192' },
  { merchant: 'ROMY', designNo: 'AL-217' },
  { merchant: 'ROMY', designNo: 'AL-505' },
  { merchant: 'ROMY', designNo: 'AL-506' },
  { merchant: 'ROMY', designNo: 'RW387A' },
  { merchant: 'ROMY', designNo: 'RW387B' },
  { merchant: 'ROSCO', designNo: '41' },
  { merchant: 'ROSCO', designNo: '18730' },
  { merchant: 'ROSCO', designNo: '18869' },
  { merchant: 'ROSCO', designNo: '4228' },
  { merchant: 'ROSCO', designNo: 'AL-375' },
  { merchant: 'ROSCO', designNo: 'H18868' },
  { merchant: 'ROSCO', designNo: 'H19180' },
  { merchant: 'ROSCO', designNo: 'RCBL01' },
  { merchant: 'ROSCO', designNo: 'RCBL02' },
  { merchant: 'ROSCO', designNo: 'RCBL03' },
  { merchant: 'ALDONA', designNo: 'AL-408' },
  { merchant: 'BLEZZA TR', designNo: '19778' },
  { merchant: 'CAPE TOWN', designNo: 'DN-402' },
  { merchant: 'CAPE TOWN', designNo: 'HT-402' },
  { merchant: 'CV', designNo: '1521' },
  { merchant: 'CV', designNo: 'ALC003' },
  { merchant: 'CV', designNo: 'ALC004' },
  { merchant: 'CV', designNo: 'ALC005' },
  { merchant: 'DELSEY', designNo: 'AL-812' },
  { merchant: 'ELITA', designNo: 'AJ-658' },
  { merchant: 'FRANCO', designNo: 'AL-658' },
  { merchant: 'FRANCO', designNo: 'AL658A' },
  { merchant: 'FRANCO', designNo: 'AL658B' },
  { merchant: 'FRANCO', designNo: 'AL658C' },
  { merchant: 'PARAMOUNT', designNo: 'AL-659' },
  { merchant: 'ROMILANO', designNo: 'AL-627' },
  { merchant: 'ROMILANO', designNo: 'AL-814' },
  { merchant: 'ROMILANO', designNo: 'AL-819' },
  { merchant: 'ROMILANO', designNo: 'AL-820' },
  { merchant: 'ROYAL TR', designNo: '9862' },
  { merchant: 'ROYAL TR', designNo: 'AL-213' },
  { merchant: 'ROYAL TR', designNo: 'AL-223' },
  { merchant: 'ROYAL TR', designNo: 'AL-412' },
  { merchant: 'ROYAL TR', designNo: 'AL-415' },
  { merchant: 'ROYAL TR', designNo: 'AL-417' },
  { merchant: 'ROYAL TR', designNo: 'AL-681' },
  { merchant: 'ROYAL TR', designNo: 'H21291' },
  { merchant: 'SUPER TR', designNo: '443476' },
  { merchant: 'SUPER TR', designNo: 'AL-216' },
  { merchant: 'SUPER TR', designNo: 'AL-219' },
  { merchant: 'SUPER TR', designNo: 'AL-221' },
  { merchant: 'SUPER TR', designNo: 'AL-222' },
  { merchant: 'SUPER TR', designNo: 'AL-413' },
  { merchant: 'SUPER TR', designNo: 'AL-574' },
  { merchant: 'SUPPER TR', designNo: 'AL-574' },
  { merchant: 'SWISS GOLD', designNo: 'AL-516' },
  { merchant: 'VICARIO', designNo: 'AL-688' },
  { merchant: 'VICARIO', designNo: 'VIC001' },
  { merchant: 'VIOLA', designNo: 'ALH001' },
  { merchant: 'VIOLA', designNo: 'ALH002' },
  { merchant: 'VIOLA', designNo: 'ALH003' },
  { merchant: 'VIOLA', designNo: 'ALH005' },
  { merchant: 'VIOLA', designNo: 'ALH006' },
  { merchant: 'VIOLA', designNo: 'ALH007' },
  { merchant: 'VIOLA', designNo: 'VIS001' },
  { merchant: 'VIOLA', designNo: 'VIS002' },
  { merchant: 'VIOLA', designNo: 'VIS003' },
  { merchant: 'VIOLA', designNo: 'VIS004' },
  { merchant: 'VISONI', designNo: 'AL-791' },
  { merchant: 'KIA', designNo: '21780' },
  { merchant: 'KIA', designNo: '4542' },
  { merchant: 'KIA', designNo: 'H19945' },
  { merchant: 'KIA', designNo: 'H20229' },
  { merchant: 'MULBURY', designNo: 'AL-305' },
  { merchant: 'MULBURY', designNo: 'AL-397' },
  { merchant: 'TESSCOT', designNo: 'H20145' },
  { merchant: 'FRANCESCA', designNo: 'ALW003' },
  { merchant: 'GABBIADINI', designNo: 'ALW005' },
  { merchant: 'GABBIADINI', designNo: 'ALW006' },
  { merchant: 'GABBIADINI', designNo: 'ALW007' },
  { merchant: 'HUDDERSFIELD', designNo: 'ALW002' },
  { merchant: 'SAPHIRE', designNo: 'ALW002' },
  { merchant: 'TROPICAL', designNo: 'ALW004' },
  { merchant: 'FABIO LY', designNo: 'ALY011' },
  { merchant: 'FABIO LY', designNo: 'ALY012' },
  { merchant: 'FABIO LY', designNo: 'ALY013' },
  { merchant: 'FLEXIMA BLK LY', designNo: 'FLX001' },
  { merchant: 'FLEXIMA BLK LY', designNo: 'FLX002' },
  { merchant: 'FLEXIMA BLK LY', designNo: 'FLX003' },
  { merchant: 'FLEXIMA BLK LY', designNo: 'FLX004' },
  { merchant: 'FLEXIMA LY', designNo: 'ALY002' },
  { merchant: 'FLEXIMA LY', designNo: 'ALY003' },
  { merchant: 'FLEXIMATE 4LY', designNo: '2669' },
  { merchant: 'FLEXIMATE 4LY', designNo: 'ALY015' },
  { merchant: 'FLEXIMATE 4LY', designNo: 'ALY016' },
  { merchant: 'FORTUNE LY', designNo: 'ALY007' },
  { merchant: 'FORTUNE LY', designNo: 'ALY008' },
  { merchant: 'LEO LYCRA', designNo: 'AL654' },
  { merchant: 'LEO LYCRA', designNo: 'AL717' },
  { merchant: 'LEO LYCRA', designNo: 'ALY001' },
  { merchant: 'LIBERTA LY', designNo: 'ALY005' },
  { merchant: 'RICH LYCRA', designNo: 'L18924' },
  { merchant: 'RUBY', designNo: 'L20092' },
  { merchant: 'SOFT LYCRA', designNo: '11507' },
  { merchant: 'SOFT LYCRA', designNo: '11509' },
  { merchant: 'SOFT LYCRA', designNo: '19138' },
  { merchant: 'SOFT LYCRA', designNo: '19531' },
  { merchant: 'SOFT LYCRA', designNo: 'AL-105' },
  { merchant: 'SOFT LYCRA', designNo: 'AL-158' },
  { merchant: 'SOFT LYCRA', designNo: 'AL118' },
  { merchant: 'SOFT LYCRA', designNo: 'L19823' },
  { merchant: 'STRETCHABLE', designNo: '11502' },
  { merchant: 'STRETCHABLE', designNo: '11505' },
  { merchant: 'STRETCHABLE', designNo: '11506' },
  { merchant: 'SUPER LYCRA', designNo: 'ALY004' }
];

// Create output directory
const outputDir = path.join(__dirname, 'generated_qr_codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate QR codes
async function generateQRCodes() {
  console.log(`Starting to generate ${sampleData.length} QR codes...`);
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sampleData.length; i++) {
    const sample = sampleData[i];
    const qrCodeId = `QR_${Date.now()}_${i + 1}`;
    
    try {
      // Create QR data object
      const qrData = {
        productionSampleType: 'Paper Booklet', // Default type
        designNo: sample.designNo,
        merchant: sample.merchant,
        qrCodeId: qrCodeId,
        pieces: 1, // Default pieces
        dateCreated: new Date().toISOString().split('T')[0]
      };

      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Save QR code as PNG
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      const fileName = `${sample.merchant.replace(/[^a-zA-Z0-9]/g, '_')}_${sample.designNo.replace(/[^a-zA-Z0-9]/g, '_')}_${qrCodeId}.png`;
      const filePath = path.join(outputDir, fileName);
      
      fs.writeFileSync(filePath, base64Data, 'base64');

      // Save sample data to results
      results.push({
        ...qrData,
        qrCodeFileName: fileName,
        qrCodeFilePath: filePath
      });

      successCount++;
      console.log(`✓ Generated QR code ${i + 1}/${sampleData.length}: ${sample.merchant} - ${sample.designNo}`);

    } catch (error) {
      errorCount++;
      console.error(`✗ Error generating QR code ${i + 1}/${sampleData.length}: ${sample.merchant} - ${sample.designNo}`, error.message);
    }
  }

  // Save results to JSON file
  const resultsFilePath = path.join(outputDir, 'qr_codes_data.json');
  fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2));

  // Generate summary report
  const summary = {
    totalSamples: sampleData.length,
    successCount: successCount,
    errorCount: errorCount,
    generatedAt: new Date().toISOString(),
    outputDirectory: outputDir
  };

  const summaryFilePath = path.join(outputDir, 'generation_summary.json');
  fs.writeFileSync(summaryFilePath, JSON.stringify(summary, null, 2));

  console.log('\n=== GENERATION COMPLETE ===');
  console.log(`Total samples: ${summary.totalSamples}`);
  console.log(`Successfully generated: ${summary.successCount}`);
  console.log(`Errors: ${summary.errorCount}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`QR codes data: ${resultsFilePath}`);
  console.log(`Summary report: ${summaryFilePath}`);
}

// Run the generation
generateQRCodes().catch(console.error);
