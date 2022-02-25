import { Links, LinksFunction, LiveReload, Outlet, useCatch, MetaFunction, Meta } from "remix";
import styles from "./styles/app.css";
import fontStyles from "./styles/fonts.css";

export const links: LinksFunction = () => {
	return [
		{ rel: "stylesheet", href: styles },
		{ rel: "stylesheet", href: fontStyles },
	];
};

export const meta: MetaFunction = () => {
	const description = `Learn Remix and laugh at the same time!`;
	return {
		description,
		keywords: "Remix,jokes",
		"twitter:image": "/twitterCard.png",
		"twitter:card": "summary_large_image",
		"twitter:creator": "@remix_run",
		"twitter:site": "@remix_run",
		"twitter:title": "Remix Jokes",
		"twitter:description": description,
	};
};

function Document({
	children,
	title = `Remix: So great, it's funny!`,
}: {
	children: React.ReactNode;
	title?: string;
}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<Meta />
				<title>{title}</title>
				<Links />
			</head>
			<body>
				{children}
				{process.env.NODE_ENV === "development" ? <LiveReload /> : null}
			</body>
		</html>
	);
}

export default function App() {
	return (
		<Document>
			<Outlet />
		</Document>
	);
}

export function ErrorBoundary({ error }: { error: Error }) {
	return (
		<Document title="Uh-oh!">
			<div className="px-3 py-2 bg-red-500 h-min">
				<h1>App Error</h1>
				<pre>{error.message}</pre>
			</div>
		</Document>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	return (
		<Document title={`${caught.status} ${caught.statusText}`}>
			<div className="bg-red-500 px-3 py-2 h-min">
				<h1 className="text-base font-normal">
					{caught.status} {caught.statusText}
				</h1>
			</div>
		</Document>
	);
}
