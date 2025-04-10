"use client";

import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	fetchUserData,
	sendLoginLink,
	signInWithGoogle,
} from "@/app/lib/firebaseAuth";
import {
	Button,
	TextField,
	Typography,
	Container,
	Paper,
	Alert,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/state/users/userSlice";
import { AppDispatch } from "../state/store";

import { Google } from "@mui/icons-material";

const LoginForm = () => {
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [loading, setLoading] = useState(false);

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
			setSuccessMessage("Email sent to" + data.email);
			reset();
		} catch (error: any) {
			setErrorMessage(error.message);
		}
		setLoading(false);
	};

	const handleGoogleLogin = async () => {
		setLoading(true);
		try {
			const userData = await signInWithGoogle();
			const user = await fetchUserData(userData.uid);
			dispatch(setUser(user));
		} catch (error: any) {
			setErrorMessage(error.message);
		}
		setLoading(false);
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
									required
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
		</main>
	);
};

export default LoginForm;
