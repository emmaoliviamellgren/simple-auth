import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#FFA500",
		},
	},
	typography: {
		fontFamily: '"Geist"',
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					borderRadius: 8,
					padding: "8px 42px",
					boxShadow: "none",
					"&:hover": {
						boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
					},
				},
			},
		},
	},
});
