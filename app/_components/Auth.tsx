"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/state/store";
import UserData from "./UserData";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { User } from "firebase/auth";
import { completeEmailLinkLogin, fetchUserData } from "../lib/auth.db";
import { setUser } from "../state/users/userSlice";

export const Auth = () => {
	const [showRegister, setShowRegister] = useState(true);
	const [loading, setLoading] = useState(false);

	const user = useSelector((state: RootState) => state.auth.user);
	const dispatch = useDispatch<AppDispatch>();

	const isAuthenticated = !!user.uid;

	useEffect(() => {
		async function checkForEmailLink() {
			setLoading(true);
			try {
				const user = await completeEmailLinkLogin();
				if (user) {
					await handleUserAuthenticated(user);
				}
			} catch (error: any) {
				console.log("Error completing email link login:", error);
			} finally {
				setLoading(false);
			}
		}

		checkForEmailLink();
	}, [dispatch]);

	const handleUserAuthenticated = async (user: User) => {
		try {
			const _user = await fetchUserData(user.uid);
			dispatch(setUser(_user));
			console.log("User data fetched successfully:", _user);
		} catch (error: any) {
			console.error("Error fetching user data:", error);
			console.log("Login failed: ", error);
		}
	};

	return (
		<> {loading && <div className="text-center flex items-center justify-center mx-auto">Loading...</div>}
			{isAuthenticated ? (
				<UserData user={user} />
			) : (
				<main className="text-center mx-auto px-4 py-8">
					{showRegister ? <RegisterForm /> : <LoginForm />}
					<>
						{showRegister ? (
							<Box
								sx={{
									mt: 4,
									textAlign: "center",
									display: "flex",
									flexDirection: "column",
									gap: 1,
								}}>
								<Typography variant="body2">
									Already a member?
								</Typography>
								<Typography
									onClick={() =>
										setShowRegister(!showRegister)
									}
									component="a"
									variant="body2"
									color="primary"
									sx={{ cursor: "pointer" }}>
									Login
								</Typography>
							</Box>
						) : (
							<Box
								sx={{
									mt: 4,
									textAlign: "center",
									display: "flex",
									flexDirection: "column",
									gap: 1,
								}}>
								<Typography variant="body2">
									Don't have an account?
								</Typography>
								<Typography
									onClick={() =>
										setShowRegister(!showRegister)
									}
									component="a"
									variant="body2"
									color="primary"
									sx={{ cursor: "pointer" }}>
									Register
								</Typography>
							</Box>
						)}
					</>
				</main>
			)}
		</>
	);
}
