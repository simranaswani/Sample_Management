// Dummy samples for testing QR printing - including long merchant names
const testSamples = [
  {
    merchant: "FLEXIMA BLACK",
    productionSampleType: "Paper Booklet",
    designNo: "FLX004",
    pieces: 10
  },
  {
    merchant: "CELEBRITY FASHION",
    productionSampleType: "Hanger",
    designNo: "CEL-2024",
    pieces: 25
  },
  {
    merchant: "ASPIRE TEXTILES",
    productionSampleType: "Box",
    designNo: "ASP-101",
    pieces: 15
  },
  {
    merchant: "BLEZZA TROVIN INTERNATIONAL",
    productionSampleType: "Bag",
    designNo: "BT-555",
    pieces: 8
  },
  {
    merchant: "SHORT",
    productionSampleType: "Envelope",
    designNo: "SH-001",
    pieces: 50
  }
];

async function seedSamples() {
  console.log("🌱 Seeding test samples...\n");
  
  try {
    const res = await fetch("http://localhost:3001/api/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ samples: testSamples })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      console.log("✅ Successfully created", data.samples?.length || testSamples.length, "samples:");
      testSamples.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.merchant} - ${s.designNo}`);
      });
      console.log("\n🎉 You can now test the QR printing at http://localhost:3000/view-qrs");
    } else {
      console.error("❌ Failed to create samples:", data);
    }
  } catch (err) {
    console.error("❌ Failed to create samples:", err.message);
  }
}

seedSamples();

