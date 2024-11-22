import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  isOpen: boolean;
  onClose?: any;
  classNames?: string;
};

export default function DialogLayout({ children, isOpen, onClose, classNames }: Props) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose ? onClose : () => {}}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* <div className="fixed inset-0 backdrop-blur-sm" /> */}
          <div className="fixed inset-0 bg-black/50 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="dialog-panel-wrapper">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={`${classNames ? classNames : 'w-fit transform overflow-hidden p-2 align-middle transition-all'}`}
              >
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
