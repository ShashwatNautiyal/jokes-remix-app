import { ReactNode } from "react";

interface LayoutProps {
	children: ReactNode;
	background?: string;
}

const Layout = (props: LayoutProps) => {
	const { children, background } = props;
	return (
		<div
			className={` min-h-screen w-full ${
				background ? background : "bg-gradient-to-br from-fuchsia-300 to-orange-200"
			}`}
		>
			{children}
		</div>
	);
};

export default Layout;
