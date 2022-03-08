import toast from 'react-hot-toast';

export const notifyToast = async (promise: Promise<unknown>, loading: string, success: string) => {
	await toast.promise(
		promise,
		{
			loading: loading,
			success: success,
			error: (error) => `Error: ${error as string}`,
		},
		{
			style: {
				padding: '8px 16px',
				borderRadius: '8px',
				border: '1px solid white',
			},
		}
	);
};
