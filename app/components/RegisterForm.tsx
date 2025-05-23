"use client";

import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	authenticateWithGoogle,
	fetchUserData,
	sendLoginLink,
	signInWithGoogle,
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
import { AppDispatch } from "@/app/state/store";
import { setUser } from "@/app/state/users/userSlice";
import { Google } from "@mui/icons-material";
import { User } from "firebase/auth";

const RegisterForm = () => {
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const [openRoleDialog, setOpenRoleDialog] = useState(false);
	const [selectedRole, setSelectedRole] = useState("");
	const [roleError, setRoleError] = useState("");
	const [googleUser, setGoogleUser] = useState<User | null>(null);

	const [loading, setLoading] = useState(false);

	const dispatch = useDispatch<AppDispatch>();

	type FormData = {
		name: string;
		email: string;
		role: string;
	};

	const schema: ZodType<FormData> = z.object({
		name: z.string().min(1, "Name is required"),
		email: z
			.string()
			.min(1, "Email is required")
			.email("Invalid email format"),
		role: z.string().min(1, "Role is required"),
	});

	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: "",
			email: "",
			role: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		localStorage.setItem("userName", data.name);
		localStorage.setItem("userRole", data.role);
		setLoading(true);
		try {
			await sendLoginLink(data.email);
			setSuccessMessage("Email sent to " + data.email);
			reset();
		} catch (error: any) {
			setErrorMessage(error.message);
			console.log("Failed to register user: ", error);
		}
		setLoading(false);
	};

	const handleGoogleClick = async () => {
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
		}
		setLoading(false);
	};

	return (
		<>
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
						Register
					</Typography>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Controller
							name="name"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									fullWidth
									label="Name"
									variant="standard"
									disabled={loading}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
									sx={{ mb: 2 }}
								/>
							)}
						/>
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
						<Controller
							name="role"
							control={control}
							render={({ field }) => (
								<FormControl
									fullWidth
									error={!!errors.role}>
									<InputLabel>Role</InputLabel>
									<Select
										{...field}
										label="Role">
										<MenuItem value="doctor">
											Doctor
										</MenuItem>
										<MenuItem value="nurse">Nurse</MenuItem>
										<MenuItem value="patient">
											Patient
										</MenuItem>
										<MenuItem value="admin">Admin</MenuItem>
									</Select>
									{!!errors.role && (
										<FormHelperText>
											{errors.role.message}
										</FormHelperText>
									)}
								</FormControl>
							)}
						/>
						<Button
							type="submit"
							disabled={loading}
							fullWidth
							variant="contained"
							color="primary"
							sx={{ mt: 3, mb: 2 }}>
							Send email link
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
							onClick={handleGoogleClick}
							disabled={loading}
							fullWidth
							variant="outlined"
							color="primary"
							sx={{ mt: 1 }}
							startIcon={<Google />}>
							Continue with Google
						</Button>

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
						onClick={() => setOpenRoleDialog(false)}
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
		</>
	);
};

export default RegisterForm;
