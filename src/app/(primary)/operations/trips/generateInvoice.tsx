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

type Props = {
  trip: TRIP;
};
export default function GenerateInvoiceButton({ trip }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const { company } = useCurrentCompany();
  const { authUser } = useAuthContext();

  const generatePDF = async () => {
    if (!trip) {
      toast.error('No trip data available');
      return;
    }

    const doc = new jsPDF();

    // Add Logo
    const logoURL = company?.photoURL || '/images/logo-black.png'; // Use company.photoURL or fallback to default logo
    const logoBase64 = await fetch(logoURL)
      .then((response) => response.blob())
      .then((blob) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => {
        // Fallback to default logo in case of an error
        return '/images/logo-black.png';
      });

    const invoiceDate = trip.startedAt.toDate().toLocaleDateString();

    doc.addImage(logoBase64, 'PNG', 10, 10, 40, 20);

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

    // Save PDF
    doc.save('Invoice.pdf');
    setProcessing(false);
    setIsOpen(false);
    toast.success('Invoice generated successfully!');
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
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

        <div className="mt-5 grid items-center gap-3">
          <div className="flex items-center justify-between gap-5">
            <label className="form-label">Display Name:</label>
          </div>
        </div>

        <div className="mt-10 flex w-full justify-end gap-5">
          <button onClick={() => setIsOpen(false)} className="btn btn-outline-danger">
            Cancel
          </button>
          <button
            onClick={generatePDF}
            disabled={processing || !authUser}
            className="btn btn-danger"
          >
            Generate Invoice
          </button>
        </div>
      </DialogLayout>
    </>
  );
}
