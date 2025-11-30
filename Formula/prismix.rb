class Prismix < Formula
  desc "Visual CouchDB query builder with AI-powered query generation"
  homepage "https://github.com/karsaw/prismix"
  url "https://github.com/karsaw/prismix/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "7dafef1e94dda710a889b42b6416f400b1d4b628dfa1100eda77f0410d0fb641"
  license "MIT"

  depends_on "node"

  def install
    # Install dependencies
    system "npm", "install", "--production"
    
    # Copy all files to libexec
    libexec.install Dir["*"]
    
    # Create wrapper scripts
    (bin/"prismix").write <<~EOS
      #!/bin/bash
      cd "#{libexec}" && npm start
    EOS
    
    (bin/"prismix-server").write <<~EOS
      #!/bin/bash
      cd "#{libexec}" && npm run server
    EOS
    
    (bin/"prismix-dev").write <<~EOS
      #!/bin/bash
      cd "#{libexec}" && npm run dev
    EOS
  end

  def post_install
    ohai "Prismix has been installed!"
    ohai "Run 'prismix' to start both frontend and backend"
    ohai "Or run 'prismix-server' and 'prismix-dev' separately"
    ohai ""
    ohai "The application will be available at:"
    ohai "  Frontend: http://localhost:9876"
    ohai "  Backend:  http://localhost:9877"
  end

  test do
    system "node", "--version"
  end
end
