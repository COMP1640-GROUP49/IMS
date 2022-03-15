export const scrollToElement = (id: string) => {
	document.getElementById(id)?.scrollIntoView({
		behavior: 'smooth',
	});
};

export const scrollToElementByClassName = (className: string) => {
	document.getElementsByClassName(className)[0]?.scrollIntoView({
		behavior: 'smooth',
		block: 'start',
	});
};
