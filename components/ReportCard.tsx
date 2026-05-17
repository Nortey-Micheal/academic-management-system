'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StudentReport } from '@/lib/types';
import { getSchoolConfig } from '@/config';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';



interface ReportCardProps {
  student: StudentReport;
  schoolLogo?: string;
  headteacherSignature?: string;
}

const school = getSchoolConfig()

const ReportCard: React.FC<ReportCardProps> = ({ student }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const totalScore = student.subjects.reduce((sum, subject) => sum + subject.totalScore, 0);

  const handlePrint = () => {
    const element = reportRef.current;
    if (!element) {
      alert('Report not found');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '', 'height=900,width=900');
    if (!printWindow) {
      alert('Please disable popup blockers and try again');
      return;
    }

    // Write the report content to the new window
    printWindow.document.write('<!DOCTYPE html><html><head><title>Print Report</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(getStyles());
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(element.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Trigger print dialog after content loads
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleExportPDF = () => {
    const element = reportRef.current;
    if (!element) {
      alert('Report not found');
      return;
    }

    // Create a new window for PDF export
    const printWindow = window.open('', '', 'height=900,width=900');
    if (!printWindow) {
      alert('Please disable popup blockers and try again');
      return;
    }

    // Write the report content to the new window
    printWindow.document.write('<!DOCTYPE html><html><head><title>Export Report</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(getStyles());
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(element.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Trigger print-to-PDF after content loads
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getStyles = () => {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      @page { size: A4; margin: 8mm; }
      html { margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; font-size: 10px; line-height: 1.2; color: #000; margin: 0; padding: 0; }
      .w-full { width: 100%; }
      .max-w-4xl { max-width: 100%; margin: 0 auto; padding: 5mm; }
      .bg-white { background-color: #ffffff !important; }
      .p-8 { padding: 5mm; }
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .gap-6 { gap: 2mm; }
      .gap-4 { gap: 1.5mm; }
      .gap-8 { gap: 2mm; }
      .items-start { align-items: flex-start; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .justify-between { justify-content: space-between; }
      .mb-6 { margin-bottom: 2mm; }
      .mb-4 { margin-bottom: 1.5mm; }
      .mb-2 { margin-bottom: 0.5mm; }
      .mt-8 { margin-top: 1mm; }
      .mt-2 { margin-top: 0.5mm; }
      .mt-4 { margin-top: 1mm; }
      .mt-1 { margin-top: 0.3mm; }
      .flex-1 { flex: 1; }
      .text-center { text-align: center; }
      .text-2xl { font-size: 17px; }
      .text-sm { font-size: 14px; }
      .text-xm { font-size: 8px; }
      .font-bold { font-weight: bold; }
      .border-2 { border: 2px solid #000; }
      .border { border: 1px solid #000; }
      .border-b { border-bottom: 1px solid #000; }
      .border-t { border-top: 1px solid #000; }
      .border-black { border-color: #000; }
      .bg-gray-600 { background-color: #4b5563 !important; color: white !important; }
      .bg-gray-200 { background-color: #d3d3d3 !important; }
      .bg-gray-50 { background-color: #f9f9f9 !important; }
      .bg-gray-100 { background-color: #efefef !important; }
      .text-white { color: white !important; }
      .text-gray-600 { color: #666; }
      .py-2 { padding-top: 1mm; padding-bottom: 1mm; }
      .px-2 { padding-left: 0.8mm; padding-right: 0.8mm; }
      .p-2 { padding: 0.8mm; }
      .p-4 { padding: 1mm; }
      .p-1 { padding: 0.9mm; }
      .pt-1 { padding-top: 0.5mm; }
      .pt-2 { padding-top: 1mm; }
      .h-20 { height: 5mm; }
      .h-16 { height: 4mm; }
      .w-32 { width: 8mm; }
      .grid { display: grid; }
      .grid-cols-2 { grid-template-columns: 1fr 1fr; }
      .grid-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
      table { border-collapse: collapse; width: 100%; font-size: 8px; }
      th, td { border: 1px solid #000; padding: 0.4mm 0.6mm; text-align: left; }
      th { background-color: #4b5563 !important; color: white !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead tr { background-color: #4b5563 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tbody tr td { background-color: #ffffff !important; }
      .remark-section { display: flex; gap: 1mm; align-items: flex-start; }
      .remark-box { flex: 2; }
      .signature-box { flex: 1; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; width: 100%; }
        .max-w-4xl { max-width: 100%; margin: 0; padding: 8mm; }
        html { margin: 0; padding: 0; }
        table { page-break-inside: avoid; }
        .bg-gray-600 { background-color: #4b5563 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-200 { background-color: #d3d3d3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        th { background-color: #4b5563 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        tbody tr td { background-color: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `;
  };

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-6 lg:justify-center flex-wrap">
        <Button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Print Report
        </Button>
        <Button
          onClick={handleExportPDF}
          className="bg-green-600 hover:bg-green-700"
        >
          Export to PDF
        </Button>
      </div>

      <div
        ref={reportRef}
        className="bg-white p-2 lg:p-8 max-w-4xl mx-auto"
        style={{
          fontFamily: "'Arial', sans-serif",
          fontSize: '11px',
          lineHeight: '1.3',
          color: '#000',
        }}
      >
        {/* Header Section */}
        <div className="flex gap-6 mb-6 items-start">
          <div className="flex items-center justify-center" style={{ width: '70px', height: '70px' }}>
            <div className="text-sm text-center text-gray-600">
              <Image width={100} height={100} alt={`${school.name}'s Logo`} src={school.branding.logo}/>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold">MOUNT OLIVE'S SCHOOL</h1>
              <div className="text-sm mt-1">
                <div><strong>ADDRESS:</strong> P.O BOX TS 406 TESHIE - ACCRA</div>
                <div><strong>TEL:</strong> 0246989676 | <strong>LOCATION:</strong> OFF ANUMA NTU JUNC.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="bg-gray-600 text-white text-center py-2 font-bold mb-2 border-2 border-black">
          PUPIL'S TERMLY REPORT ({`Basic ${student.grade}`})
        </div>

        {/* Student Info Section */}
        <div className="mb-4 border-2 border-black">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="border border-black font-bold bg-gray-200 p-1 w-1/4" style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>PUPIL:</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{student.name}</td>
                <td className="border border-black font-bold bg-gray-200 p-1 w-1/4" style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>ATTEND</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{`${student.attendance.presentDays}`} / {`${student.attendance.totalDays}`}</td>
              </tr>
              <tr>
                <td className="border border-black font-bold bg-gray-200 p-1" style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>AGE:</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{student.age}</td>
                <td className="border border-black font-bold bg-gray-200 p-1" style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>TERM END:</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{formatDate(student.termEnding)}</td>
              </tr>
              <tr>
                <td className="border border-black font-bold bg-gray-200 p-1" style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>CLASS:</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>BASIC {`${student.grade}`}</td>
                <td className="border border-black font-bold bg-gray-200 p-1" style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>PROMOTED:</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{student.promotedTo}</td>
              </tr>
              <tr>
                <td className="border border-black font-bold bg-gray-200 p-1" style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>TERM:</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{student.term}</td>
                <td className="border border-black font-bold bg-gray-200 p-1" style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>PERIOD:</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{student.academicPeriod}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Subjects Table */}
        <div className="mb-4 w-full overflow-auto border-2 border-black">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-600 text-white" style={{ backgroundColor: '#4b5563' }}>
                <td className="border border-black p-1 font-bold text-sm" style={{ backgroundColor: '#4b5563', color: 'white' }}>SUBJECT</td>
                <td className="border border-black p-1 font-bold text-center text-sm" style={{ backgroundColor: '#4b5563', color: 'white' }}>Class Score 50%</td>
                <td className="border border-black p-1 font-bold text-center text-sm" style={{ backgroundColor: '#4b5563', color: 'white' }}>Exams Score 50%</td>
                <td className="border border-black p-1 font-bold text-center text-sm" style={{ backgroundColor: '#4b5563', color: 'white' }}>Total Score</td>
                <td className="border border-black p-1 font-bold text-center text-sm" style={{ backgroundColor: '#4b5563', color: 'white' }}>Grade</td>
                <td className="border border-black p-1 font-bold text-sm" style={{ backgroundColor: '#4b5563', color: 'white' }}>Remarks</td>
              </tr>
            </thead>
            <tbody>
              {student.subjects.map((subject) => (
                <tr key={subject.name}>
                  <td className="border border-black p-1 font-bold text-sm" style={{ backgroundColor: '#ffffff' }}>{subject.name}</td>
                  <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{`${subject.classScore}`}</td>
                  <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{`${subject.examsScore}`}</td>
                  <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{`${subject.totalScore}`}</td>
                  <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#ffffff' }}>{subject.grade}</td>
                  <td className="border border-black p-1 text-sm" style={{ backgroundColor: '#ffffff' }}>{subject.remarks}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-black p-1 text-sm" style={{ backgroundColor: '#efefef', fontWeight: 'bold' }}>Total</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#efefef' }}></td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#efefef' }}></td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#efefef', fontWeight: 'bold' }}>{`${totalScore}`}</td>
                <td className="border border-black p-1 text-center text-sm" style={{ backgroundColor: '#efefef' }}></td>
                <td className="border border-black p-1 text-sm" style={{ backgroundColor: '#efefef' }}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Conduct & Attitude */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="border-2 border-black">
            <div className="font-bold bg-gray-200 border-b border-black p-1 text-sm">Conduct:</div>
            <div className="p-1 text-sm">{student.conduct}</div>
          </div>
          <div className="border-2 border-black">
            <div className="font-bold bg-gray-200 border-b border-black p-1 text-sm">Attitude: </div>
            <div className="p-1 text-sm">{student.attitude}</div>
          </div>
        </div>

        {/* Class Teacher Remark with Signature */}
        <div className="remark-section mb-4">
          <div className="remark-box border-2 border-black">
            <div className="font-bold bg-gray-200 border-b border-black p-1 text-sm">Class Teacher's Remark:</div>
            <div className="p-1 text-sm ">{student.classTeacherRemark}</div>
          </div>
          <div className="signature-box border-2 border-black flex flex-col items-center justify-center" style={{ minHeight: '80px' }}>
            <div className="text-center flex flex-col items-center justify-center h-full">
              <div className="border-2 border-black p-1 bg-gray-50 flex items-center justify-center" style={{ width: '70px', height: '35px' }}>
                <div className="text-sm text-gray-600">Signature</div>
              </div>
              <div className="text-sm mt-1 font-bold">Head Teacher</div>
            </div>
          </div>
        </div>

        {/* Assessment Guide */}
        <div className="mt-1 w-full overflow-auto text-sm">
          <div className="font-bold mb-1 text-sm">ASSESSMENT GUIDE</div>
          <table className="w-full border-2 border-black">
            <tbody>
              <tr>
                <td className="border border-black p-1 text-sm">A+ = DISTINCTION 90-100</td>
                <td className="border border-black p-1 text-sm">A = EXCELLENT 88-89</td>
                <td className="border border-black p-1 text-sm">B = VERY GOOD 70-79</td>
                <td className="border border-black p-1 text-sm">C = GOOD 60-69</td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-sm">D = PASS 50-59</td>
                <td className="border border-black p-1 text-sm">E = LOW PASS 40-49</td>
                <td className="border border-black p-1 text-sm">N = IMPROVE 30-39</td>
                <td className="border border-black p-1 text-sm">U = UNGRADED 0-29</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
