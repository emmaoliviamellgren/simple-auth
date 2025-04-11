import {
	GoogleAuthProvider,
	isSignInWithEmailLink,
	sendSignInLinkToEmail,
	signInWithEmailLink,
	signInWithPopup,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase-config";
import { User } from "../types/User";

const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		return result.user;
	} catch (error) {
		console.error("Error signing in with Google:", error);
		throw error;
	}
};

const authenticateWithGoogle = async () => {
	const googleUser = await signInWithGoogle();
	const docRef = doc(db, "emmasUsers", googleUser.uid);
	const docSnap = await getDoc(docRef);

	return {
		googleUser,
		isNewUser: !docSnap.exists(),
	};
};

const sendLoginLink = async (email: string) => {
	const actionCodeSettings = {
		url: window.location.origin,
		handleCodeInApp: true,
	};

	localStorage.setItem("emailForSignIn", email);
	return sendSignInLinkToEmail(auth, email, actionCodeSettings);
};

const completeEmailLogin = async () => {
	if (!isSignInWithEmailLink(auth, window.location.href)) {
		return null;
	}
	const email = localStorage.getItem("emailForSignIn");
	if (!email) {
		throw new Error("Email not found in local storage");
	}
	const result = await signInWithEmailLink(auth, email, window.location.href);
	localStorage.removeItem("emailForSignIn");
	return result.user;
};

const fetchUserData = async (uid: string): Promise<User> => {
	try {
		const docRef = doc(db, "emmasUsers", uid);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			return {
				uid: data.uid,
				email: data.email,
				name: data.name,
				role: data.role,
			} as User;
		} else {
			const currentUser = auth.currentUser;

			if (!currentUser) {
				throw new Error("No user found");
			}

			const newUser: User = {
				uid: uid,
				email: currentUser.email || "",
				name:
					currentUser.displayName ||
					localStorage.getItem("userName") ||
					"",
				role: localStorage.getItem("userRole") || "",
			};

			await setDoc(docRef, {
				...newUser,
				createdAt: new Date(),
			});

			localStorage.removeItem("userName");
			localStorage.removeItem("userRole");
			localStorage.removeItem("emailForSignIn");

			return newUser;
		}
	} catch (error) {
		console.error("Error getting/creating user data: ", error);
		throw error;
	}
};

const logoutUser = async () => {
	try {
		await auth.signOut();
		localStorage.removeItem("userName");
		localStorage.removeItem("userRole");
		localStorage.removeItem("emailForSignIn");
	} catch (error) {
		console.error("Error logging out:", error);
	}
};

export {
	logoutUser,
	fetchUserData,
	signInWithGoogle,
	sendLoginLink,
	completeEmailLogin,
	authenticateWithGoogle
};
