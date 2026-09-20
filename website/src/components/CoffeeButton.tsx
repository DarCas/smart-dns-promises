const HOSTED_BUTTON_ID = 'YZQDE3TEYDBWA';

function CoffeeIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M2 6h12v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6Z" />
			<path d="M14 8h1.5a2.5 2.5 0 0 1 0 5H14v-5Z" fill="none" stroke="currentColor" strokeWidth="2" />
			<path
				d="M6 2c.7 1 2 1.4 3 2.4C8 5.5 6.7 5.9 6 7c-.7-1-2-1.4-3-2.4C4 3.5 5.3 3.1 6 2Z"
				stroke="currentColor"
				strokeWidth="1.4"
			/>
		</svg>
	);
}

export function CoffeeButton({ className = 'btn btn--coffee' }: { className?: string }) {
	return (
		<form
			action="https://www.paypal.com/cgi-bin/webscr"
			method="post"
			target="_blank"
			className="coffee-form"
		>
			<input type="hidden" name="cmd" value="_s-xclick" />
			<input type="hidden" name="hosted_button_id" value={HOSTED_BUTTON_ID} />
			<button type="submit" className={className} aria-label="Buy me a coffee (PayPal)">
				<CoffeeIcon />
				Buy me a coffee
			</button>
		</form>
	);
}