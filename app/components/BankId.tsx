import QRCode from "react-qr-code";

const BankId = () => {
	return (
		<QRCode
			value="https://example.com/mockbankid12345"
			size={180}
			level="H"
			style={{ height: "80px", width: "fit-content", aspectRatio: 1 / 1, margin: "0 auto", boxShadow: "0 0 10px rgba(0, 0, 0, 0.4)" }}
			viewBox={`0 0 256 256`}
		/>
	);
};

export default BankId;
