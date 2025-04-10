"use client";

import { Button, Container, Paper, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../state/store";
import { useState } from "react";
import { resetUser } from "../state/users/userSlice";
import { logoutUser } from "../lib/auth.db";
import { User } from "../types/User";

const UserData = ({ user }: { user: User }) => {
	const dispatch = useDispatch<AppDispatch>();

	const [loading, setLoading] = useState(false);

	console.log("UserData component rendered with user:", user);

	const logout = async () => {
		setLoading(true);
		try {
			await logoutUser();
			dispatch(resetUser());
		} catch (error: any) {
			console.log("Error logging out:", error);
		}
		setLoading(false);
	};

	return (
		<Container
			component="main"
			maxWidth="xs"
			sx={{
				display: "flex",
				justifyContent: "center",
				flexDirection: "column",
				gap: 2,
			}}>
			<Paper
				elevation={3}
				sx={{ p: 4, mt: 8 }}>
				<div className="flex items-center gap-2">
					<Typography sx={{ color: "text.secondary" }}>
						Name of user:
					</Typography>
					<Typography>{user.name}</Typography>
				</div>
				<div className="flex items-center gap-2">
					<Typography sx={{ color: "text.secondary" }}>
						Role of user:
					</Typography>
					<Typography>{user.role}</Typography>
				</div>
			</Paper>
			<Button
				onClick={() => logout()}
				fullWidth
				variant="contained"
				color="primary"
				disabled={loading}>
				Logout
			</Button>
		</Container>
	);
};

export default UserData;
