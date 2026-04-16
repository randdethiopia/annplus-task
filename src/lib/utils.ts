export const normalizePhone = (phone: string): string => {
	const trimmed = phone.trim();
	if (!trimmed) return "";

	
	let cleaned = trimmed.replace(/[^\d+]/g, "");
	cleaned = cleaned.replace(/(?!^)\+/g, "");

	
	if (cleaned.startsWith("00")) {
		cleaned = "+" + cleaned.slice(2);
	}

	if (cleaned.startsWith("+")) {
		return cleaned;
	}

	if (cleaned.startsWith("09") ) {
		return "+251" + cleaned.slice(1);
	}

	if (cleaned.startsWith("9") ) {
		return "+251" + cleaned;
	}

	if (cleaned.startsWith("251")) {
		return "+" + cleaned;
	}

	return cleaned;
};
