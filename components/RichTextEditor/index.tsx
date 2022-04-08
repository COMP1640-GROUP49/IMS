/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
const ReactQuill = typeof window === 'object' ? require('react-quill') : () => false;

type RichTextEditorProps = {
	placeholder?: string;
	handleEditorChange: (data: string) => void;
	value: string;
};

const RichTextEditor = ({ placeholder, handleEditorChange, value }: RichTextEditorProps) => {
	return (
		<ReactQuill
			placeholder={placeholder}
			className="rich-text-editor"
			theme="snow"
			value={value || ''}
			onChange={handleEditorChange}
		/>
	);
};

export default RichTextEditor;
