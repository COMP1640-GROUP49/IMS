/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
const ReactQuill = typeof window === 'object' ? require('react-quill') : () => false;

type RichTextEditorProps = {
	placeholder?: string;
	handleEditorChange?: (data: string) => void;
	value?: string;
	readOnly?: boolean;
};

const RichTextEditor = ({ placeholder, handleEditorChange, value, readOnly }: RichTextEditorProps) => {
	return (
		<ReactQuill
			placeholder={placeholder}
			className="rich-text-editor"
			theme="snow"
			value={value || ''}
			onChange={handleEditorChange}
			readOnly={readOnly}
		/>
	);
};

export default RichTextEditor;
