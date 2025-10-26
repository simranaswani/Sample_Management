export interface Sample {
  _id?: string;
  merchant: string;
  productionSampleType: string;
  designNo: string;
  pieces: number;
  dateCreated: string;
  qrCodeId: string;
  qrCode?: string;
}

export interface PackingSlipItem {
  srNo: number;
  merchant: string;
  productionSampleType: string;
  designNo: string;
  totalPieces: number;
  qrCodeId?: string;
}

export interface PackingSlip {
  _id?: string;
  receiverName: string;
  brokerName?: string;
  packingSlipNumber: string;
  date: string;
  items: PackingSlipItem[];
  courier?: string;
  docNo?: string;
}

export interface StockSummary {
  _id: {
    productionSampleType: string;
    designNo: string;
  };
  totalPieces: number;
  qrCodes: string[];
  dateCreated: string;
  merchant: string;
}

export interface QRCodeData {
  productionSampleType: string;
  designNo: string;
  qrCodeId: string;
}
