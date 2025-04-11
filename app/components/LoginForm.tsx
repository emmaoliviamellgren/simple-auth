"use client";

import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	authenticateWithGoogle,
	fetchUserData,
	sendLoginLink,
} from "@/app/lib/firebaseAuth";
import {
	Alert,
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/state/users/userSlice";
import { AppDispatch } from "../state/store";
import { Google } from "@mui/icons-material";
import BankId from "./BankId";
import { User } from "firebase/auth";

const LoginForm = () => {
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const [openRoleDialog, setOpenRoleDialog] = useState(false);
	const [selectedRole, setSelectedRole] = useState("");
	const [roleError, setRoleError] = useState("");
	const [googleUser, setGoogleUser] = useState<User | null>(null);

	const dispatch = useDispatch<AppDispatch>();

	type FormData = {
		email: string;
	};

	const schema: ZodType = z.object({
		email: z
			.string()
			.min(1, "Email is required")
			.email("Invalid email format"),
	});

	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		setLoading(true);
		try {
			await sendLoginLink(data.email);
			setSuccessMessage("Email sent to " + data.email);
			reset();
		} catch (error: any) {
			setErrorMessage(error.message);
		}
		setLoading(false);
	};

	const handleGoogleLogin = async () => {
		setLoading(true);
		setErrorMessage("");

		try {
			const { googleUser, isNewUser } = await authenticateWithGoogle();

			if (isNewUser) {
				setGoogleUser(googleUser);
				setOpenRoleDialog(true);
			} else {
				const user = await fetchUserData(googleUser.uid);
				dispatch(setUser(user));
			}
		} catch (error: any) {
			setErrorMessage(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleRoleSubmit = async () => {
		if (!selectedRole) {
			setRoleError("Please select a role");
			return;
		}
		if (!googleUser) {
			setErrorMessage("Authentication error");
			return;
		}
		setLoading(true);

		try {
			localStorage.setItem("userRole", selectedRole);
			const user = await fetchUserData(googleUser.uid);
			dispatch(setUser(user));
			setOpenRoleDialog(false);
		} catch (error: any) {
			setErrorMessage(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="flex flex-col items-center justify-center">
			<Container
				component="main"
				maxWidth="xs"
				sx={{ display: "flex", justifyContent: "center" }}>
				<Paper
					elevation={3}
					sx={{ p: 4, mt: 8 }}>
					<Typography
						component="h1"
						variant="h5"
						align="center"
						gutterBottom>
						Login
					</Typography>

					<form onSubmit={handleSubmit(onSubmit)}>
						<Controller
							name="email"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									fullWidth
									label="Email"
									variant="standard"
									disabled={loading}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
									sx={{ mb: 2 }}
								/>
							)}
						/>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							color="primary"
							disabled={loading}
							sx={{ mt: 3, mb: 2 }}>
							Send login link
						</Button>

						<Typography
							variant="body2"
							sx={{
								mb: 2,
								textAlign: "center",
								fontWeight: "bold",
							}}>
							or
						</Typography>

						<Button
							onClick={handleGoogleLogin}
							disabled={loading}
							fullWidth
							variant="outlined"
							color="primary"
							sx={{ mt: 1 }}
							startIcon={<Google />}>
							Continue with Google
						</Button>

						<Typography
							variant="body2"
							sx={{ mt: 3, mb: 2, textAlign: "center" }}>
							Login with BankID
						</Typography>
						<BankId />

						{successMessage && (
							<Alert
								variant="outlined"
								severity="success"
								sx={{ mt: 2 }}>
								{successMessage}
							</Alert>
						)}
						{errorMessage && (
							<Alert
								variant="outlined"
								severity="error"
								sx={{ mt: 2 }}>
								{errorMessage}
							</Alert>
						)}
					</form>
				</Paper>
			</Container>

			<Dialog
				open={openRoleDialog}
				onClose={() => !loading && setOpenRoleDialog(false)}>
				<DialogTitle>Select role</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Select your role to complete registration
					</DialogContentText>
					<FormControl
						fullWidth
						error={!!roleError}
						sx={{ mt: 2, mb: 2 }}>
						<InputLabel>Role</InputLabel>
						<Select
							value={selectedRole}
							onChange={(e) => {
								setSelectedRole(e.target.value);
								setRoleError("");
							}}
							label="Role">
							<MenuItem value="doctor">Doctor</MenuItem>
							<MenuItem value="nurse">Nurse</MenuItem>
							<MenuItem value="patient">Patient</MenuItem>
							<MenuItem value="admin">Admin</MenuItem>
						</Select>
						{roleError && (
							<FormHelperText>{roleError}</FormHelperText>
						)}
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setOpenRoleDialog(false);
							setGoogleUser(null);
						}}
						disabled={loading}
						color="primary">
						Cancel
					</Button>
					<Button
						onClick={handleRoleSubmit}
						disabled={loading}
						color="primary"
						variant="contained">
						Continue
					</Button>
				</DialogActions>
			</Dialog>
		</main>
	);
};

export default LoginForm;
