import { ReactNode } from "react";

interface ContainerProps {
	children: ReactNode;
}

const Container = (props: ContainerProps) => {
	const { children } = props;
	return (
		<div className="lg:w-10/12 md:w-11/12 w-full px-2 mx-auto h-full lg:py-8 py-4">
			{children}
		</div>
	);
};

export default Container;
