import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { Icon } from 'components/Icon';

export interface ModalProps {
	isShown: boolean;
	hide: () => void;
	modalContent: JSX.Element;
	headerText: string;
}
export const Modal: FunctionComponent<ModalProps> = ({ isShown, hide, modalContent, headerText }) => {
	const modal = (
		<div className="flex justify-center items-center absolute top-0 left-0 w-full 100vh bg-transparent py-3 sm:px-3">
			<div className="bg-slate-400 w-[500px] h-full rounded-2xl p-2">
				<div className="flex justify-end text-heading_5">
					<button onClick={hide} className="p-2">
						<Icon name="X" size={32} color="black" />
					</button>
				</div>
				<div>{headerText}</div>
				<div>{modalContent}</div>
			</div>
		</div>
	);
	return isShown ? ReactDOM.createPortal(modal, document.getElementById('modal-root')!) : null;
};
