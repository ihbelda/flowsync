// Log4brains ADRs use a leading `# Heading` as their title instead of frontmatter.
// content.config.ts backfills `title` from that heading, so Starlight already renders
// it as the page's `<h1>`. Strip the same heading from the body here to avoid showing it twice.
export function remarkStripAdrHeading() {
	return (tree, file) => {
		const filePath = file.path ?? file.history?.[0] ?? '';
		if (!/[\\/]content[\\/]docs[\\/]adr[\\/]/.test(filePath)) return;

		const first = tree.children[0];
		if (first?.type === 'heading' && first.depth === 1) {
			tree.children.shift();
		}
	};
}
