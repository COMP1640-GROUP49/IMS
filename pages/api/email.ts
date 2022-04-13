import emailjs from 'emailjs-com';
export const sendEmailToIdeaAuthor = async (emailForm: HTMLFormElement) => {
	emailjs.init(process.env.EMAIL_PUBLIC_KEY as string);
	const data = await emailjs.sendForm(
		process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID as string,
		process.env.NEXT_PUBLIC_NEW_COMMENT_ADDED_EMAIL_TEMPLATE as string,
		emailForm as unknown as string,
		process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY as string
	);
	return data;
};
export const sendEmailToCoordinatorInDepartment = async (emailForm: HTMLFormElement) => {
	emailjs.init(process.env.EMAIL_PUBLIC_KEY as string);
	const data = await emailjs.sendForm(
		process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID as string,
		process.env.NEXT_PUBLIC_NEW_IDEA_SUBMITTED_EMAIL_TEMPLATE as string,
		emailForm as unknown as string,
		process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY as string
	);
	return data;
};
