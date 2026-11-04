export interface BankDetails {
  accountName: string;
  beneficiaryName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branch: string;
  country: string;
  accountType?: string;
}

export const AAVIRA_BANK_DETAILS: BankDetails = {
  accountName: 'AAVIRA BOUTIQUE',
  beneficiaryName: 'VENKATA RAO KONDRU',
  accountNumber: '4813092900',
  bankName: 'KOTAK MAHENDRA BANK',
  ifscCode: 'KKBK0007466',
  branch: 'MADHAPUR',
  country: 'INDIA',
  accountType: 'Current / Boutique Commercial Account',
};

export const getFormattedBankDetailsText = (orderTotalINR?: number, orderRef?: string): string => {
  return [
    '══════════════════════════════════════════',
    '    AAVIRA HAUTE COUTURE • BANK TRANSFER DETAILS',
    '══════════════════════════════════════════',
    `Account Name  : ${AAVIRA_BANK_DETAILS.accountName}`,
    `Beneficiary   : ${AAVIRA_BANK_DETAILS.beneficiaryName}`,
    `Account No.   : ${AAVIRA_BANK_DETAILS.accountNumber}`,
    `Bank Name     : ${AAVIRA_BANK_DETAILS.bankName}`,
    `IFSC Code     : ${AAVIRA_BANK_DETAILS.ifscCode}`,
    `Branch        : ${AAVIRA_BANK_DETAILS.branch}`,
    `Country       : ${AAVIRA_BANK_DETAILS.country}`,
    ...(orderTotalINR ? [`Payable Amount: ₹${orderTotalINR.toLocaleString('en-IN')}`] : []),
    ...(orderRef ? [`Order Ref     : ${orderRef}`] : []),
    '══════════════════════════════════════════',
    'Modes Accepted: IMPS / NEFT / RTGS / Kotak NetBanking',
  ].join('\n');
};
