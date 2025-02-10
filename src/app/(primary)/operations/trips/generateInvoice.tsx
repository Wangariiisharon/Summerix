import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TRIP } from '@/models/trip';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DialogLayout from '@/components/dialog-layout';
import { DialogTitle } from '@headlessui/react';
import { useAuthContext } from '@/app/auth-provider';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import { doUploadImage } from '@/services/utils';
import { fbDb } from '@/firebase/configs';
import Constants from '@/Constants';
import { doc, updateDoc } from 'firebase/firestore';

type Props = {
  trip: TRIP;
};
export default function GenerateInvoiceButton({ trip }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const { company } = useCurrentCompany();
  const { authUser } = useAuthContext();

  const doSave = async (pdfBlob: Blob) => {
    try {
      const fileName = `invoice_${trip.docId}.pdf`;
      const downloadUrl = await doUploadImage(pdfBlob, 'invoices', fileName);

      const tripRef = doc(fbDb, Constants.fbTrips, trip.docId);
      await updateDoc(tripRef, {
        invoiceUrl: downloadUrl,
      });

      toast.success('Invoice saved successfully');
    } catch (error) {
      toast.error('Error saving invoice');
      console.error('doSave > error:', error);
    }
  };

  const generatePDF = async () => {
    if (!trip) {
      toast.error('No trip data available');
      return;
    }

    if (trip.invoiceUrl) {
      window.open(trip.invoiceUrl, '_blank');
      return;
    }

    setProcessing(true);

    const doc = new jsPDF();

    let logoBase64: string | undefined;

    if (company?.photoURL) {
      try {
        const response = await fetch(company.photoURL);
        const blob = await response.blob();
        logoBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error loading company logo:', error);
      }
    }

    // Ensure that a valid logo is added to the PDF
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 10, 10, 40, 20);
    }

    const invoiceDate = trip.startedAt.toDate().toLocaleDateString();

    // Add Title and Invoice Details
    doc.setFontSize(18);
    doc.text('INVOICE', 160, 20);

    doc.setFontSize(10);
    doc.text('Invoice Date:', 140, 40);
    doc.text(invoiceDate, 170, 40);

    doc.text('Invoice No:', 140, 45);
    doc.text('AKL/24/009', 170, 45);

    // Add Recipient Details
    doc.setFontSize(12);
    doc.text('TO:', 10, 50);
    doc.text(trip.client.companyName, 10, 55);

    // Add Table
    autoTable(doc, {
      startY: 70,
      head: [['DESCRIPTION', 'TRUCK NO.', 'CONTAINER NO.', 'QTY', 'AMOUNT']],
      body: [
        [
          trip.memo,
          trip.vehicle.regNumber,
          trip.containerNumber,
          trip.cargoType,
          trip.payments.dealValue,
        ],
        [
          trip.memo,
          trip.vehicle.regNumber,
          trip.containerNumber,
          trip.cargoType,
          trip.payments.dealValue,
        ],
      ],
      foot: [['', '', '', 'TOTAL', `${trip.currency} ${trip.payments.dealValue}`]],
    });

    const pdfBlob = doc.output('blob');
    await doSave(pdfBlob);
    doc.save('Invoice.pdf');
    setProcessing(false);
    setIsOpen(false);
    toast.success('Invoice generated and saved successfully!');
  };

  return (
    <>
      <button
        onClick={() => {
          if (trip.invoiceUrl) {
            window.open(trip.invoiceUrl, '_blank');
            return; // Prevent opening the dialog
          } else {
            setIsOpen(true);
          }
        }}
      >
        <DocumentArrowUpIcon className="h-5 w-5 text-primary hover:opacity-50" />
      </button>

      <DialogLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classNames="dialog-panel max-w-md"
      >
        <DialogTitle as="h3" className="dialog-title text-sm">
          Confirm Generate Invoice
        </DialogTitle>

        <div className="mt-10 flex w-full justify-end gap-5">
          <button onClick={() => setIsOpen(false)} className="btn btn-outline-danger">
            Cancel
          </button>

          <button
            onClick={generatePDF}
            disabled={processing || !authUser}
            className="btn btn-danger"
          >
            Generate & Save Invoice
          </button>
        </div>
      </DialogLayout>
    </>
  );
}
