#!/bin/bash

# Google Authentication Test Script
# This script helps test Google authentication in Request Buddy

echo "🔐 Google Authentication Test Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if test file exists
if [ ! -f "test-google-auth.html" ]; then
    print_error "test-google-auth.html not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "Select a test method:"
echo ""
echo "1) Standalone Test (test-google-auth.html)"
echo "2) Full App Test (npm run dev)"
echo "3) View Documentation"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_info "Opening standalone test page..."
        echo ""
        print_success "Test page will open in your default browser"
        echo ""
        echo "What to check:"
        echo "  ✓ Click 'Test Popup Sign-In'"
        echo "  ✓ Select Google account"
        echo "  ✓ Check log for success message"
        echo "  ✓ User info should appear"
        echo ""
        
        # Detect OS and open browser
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            open test-google-auth.html
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            xdg-open test-google-auth.html
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
            # Windows
            start test-google-auth.html
        else
            print_warning "Could not detect OS. Please open test-google-auth.html manually."
        fi
        
        print_success "Test page opened!"
        ;;
        
    2)
        print_info "Starting development server..."
        echo ""
        print_success "App will start at http://localhost:5173"
        echo ""
        echo "What to check:"
        echo "  ✓ Go to login page"
        echo "  ✓ Click 'Sign in with Google'"
        echo "  ✓ Select Google account"
        echo "  ✓ Should redirect to dashboard"
        echo "  ✓ Check browser console for logs"
        echo ""
        print_info "Press Ctrl+C to stop the server"
        echo ""
        
        npm run dev
        ;;
        
    3)
        print_info "Available documentation:"
        echo ""
        echo "  📄 GOOGLE_AUTH_STATUS.md    - Current implementation status"
        echo "  📄 GOOGLE_AUTH_FIX.md       - Detailed troubleshooting guide"
        echo "  📄 QUICK_TEST_GUIDE.md      - Quick reference for testing"
        echo "  📄 README.md                - Complete project documentation"
        echo ""
        read -p "Which file would you like to view? (1-4, or press Enter to skip): " doc_choice
        
        case $doc_choice in
            1)
                if command -v less &> /dev/null; then
                    less GOOGLE_AUTH_STATUS.md
                else
                    cat GOOGLE_AUTH_STATUS.md
                fi
                ;;
            2)
                if command -v less &> /dev/null; then
                    less GOOGLE_AUTH_FIX.md
                else
                    cat GOOGLE_AUTH_FIX.md
                fi
                ;;
            3)
                if command -v less &> /dev/null; then
                    less QUICK_TEST_GUIDE.md
                else
                    cat QUICK_TEST_GUIDE.md
                fi
                ;;
            4)
                if command -v less &> /dev/null; then
                    less README.md
                else
                    cat README.md
                fi
                ;;
            *)
                print_info "Skipping documentation view"
                ;;
        esac
        ;;
        
    4)
        print_info "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_success "Done!"
echo ""
echo "Need help? Check these files:"
echo "  • GOOGLE_AUTH_STATUS.md - Implementation status"
echo "  • QUICK_TEST_GUIDE.md - Quick testing guide"
echo "  • GOOGLE_AUTH_FIX.md - Troubleshooting guide"
echo ""
