"use client";

import { theme } from "./lib/theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";
import { store } from "@/app/state/store";
import { Auth } from "./_components/Auth";

export default function Home() {
	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<main
					className="flex justify-around items-center"
					suppressHydrationWarning>
					<Auth />
				</main>
			</ThemeProvider>
		</Provider>
	);
}
