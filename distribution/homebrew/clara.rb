# frozen_string_literal: true

# Homebrew formula scaffold for the Clara CLI.
# Not wired to a tap yet — replace url/sha256 when publishing release artifacts.
class Clara < Formula
	desc "Clara Code command-line interface"
	homepage "https://github.com/imaginationeverywhere/clara-code-cli"
	# url "https://registry.npmjs.org/@imaginationeverywhere/clara-cli/-/clara-cli-0.0.0.tgz"
	# sha256 "REPLACE_WITH_PUBLISHED_TARBALL_SHA256"
	license "MIT"
	depends_on "node"

	def install
		# Preferred: npm pack tarball expanded under libexec, then bin shim:
		# system "npm", "install", *std_npm_args
		# bin.install_symlink Dir["#{libexec}/bin/*"]
		odie "Install steps not defined — publish npm tarball and update url/sha256 first."
	end

	test do
		# assert_match version.to_s, shell_output("#{bin}/clara --version")
		true
	end
end
