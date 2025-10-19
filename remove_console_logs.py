#!/usr/bin/env python3
"""
Script to remove all console.log, console.error, console.warn, console.debug,
and console.info statements from JavaScript files.
"""

import re
import os
from pathlib import Path

# Directory containing JS files
PUBLIC_DIR = Path("/Users/Ari/workplace/projects/power-tracker-main/public")

# Pattern to match console statements (entire line)
# This pattern matches:
# - console.log(...)
# - console.error(...)
# - console.warn(...)
# - console.debug(...)
# - console.info(...)
# Including multi-line statements
CONSOLE_PATTERN = re.compile(
    r'^\s*console\.(log|error|warn|debug|info)\s*\([^;]*\);?\s*$',
    re.MULTILINE
)

# More complex pattern for multi-line console statements
MULTILINE_CONSOLE_PATTERN = re.compile(
    r'^\s*console\.(log|error|warn|debug|info)\s*\(',
    re.MULTILINE
)

def count_console_statements(content):
    """Count console statements in content."""
    count = 0
    lines = content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.search(r'^\s*console\.(log|error|warn|debug|info)\s*\(', line):
            count += 1
            # Check if it's a multi-line statement
            if '(' in line and ')' not in line:
                # Find the closing parenthesis
                depth = line.count('(') - line.count(')')
                i += 1
                while i < len(lines) and depth > 0:
                    depth += lines[i].count('(') - lines[i].count(')')
                    i += 1
                continue
        i += 1
    return count

def remove_console_statements(content):
    """Remove all console statements from JavaScript content."""
    lines = content.split('\n')
    new_lines = []
    i = 0
    removed_count = 0

    while i < len(lines):
        line = lines[i]

        # Check if this line starts a console statement
        if re.search(r'^\s*console\.(log|error|warn|debug|info)\s*\(', line):
            removed_count += 1

            # Check if it's a complete statement on one line
            if ';' in line or (')' in line and line.count('(') <= line.count(')')):
                # Single line console statement - skip it
                i += 1
                continue
            else:
                # Multi-line console statement - find and skip all lines until closing
                depth = line.count('(') - line.count(')')
                i += 1

                while i < len(lines) and depth > 0:
                    depth += lines[i].count('(') - lines[i].count(')')
                    i += 1
                continue

        # Keep this line
        new_lines.append(line)
        i += 1

    return '\n'.join(new_lines), removed_count

def process_file(file_path):
    """Process a single JavaScript file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        # Count original console statements
        original_count = count_console_statements(original_content)

        if original_count == 0:
            return file_path.name, 0, 0

        # Remove console statements
        new_content, removed_count = remove_console_statements(original_content)

        # Verify count
        remaining_count = count_console_statements(new_content)

        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return file_path.name, original_count, removed_count

    except Exception as e:
        print(f"Error processing {file_path.name}: {e}")
        return file_path.name, 0, -1

def main():
    """Main function to process all JS files."""
    js_files = sorted(PUBLIC_DIR.glob("*.js"))

    print(f"Found {len(js_files)} JavaScript files in {PUBLIC_DIR}")
    print("\nProcessing files...\n")

    results = []
    total_removed = 0

    for js_file in js_files:
        filename, original_count, removed_count = process_file(js_file)

        if removed_count > 0:
            results.append((filename, original_count, removed_count))
            total_removed += removed_count
            print(f"✓ {filename}: Removed {removed_count} console statements")
        elif removed_count == 0 and original_count == 0:
            print(f"  {filename}: No console statements found")
        else:
            print(f"✗ {filename}: Error processing file")

    print("\n" + "="*70)
    print("SUMMARY REPORT")
    print("="*70)

    if results:
        print(f"\nFiles cleaned: {len(results)}")
        print(f"Total console statements removed: {total_removed}\n")

        print("Breakdown by file:")
        print("-" * 70)
        for filename, original, removed in sorted(results, key=lambda x: x[2], reverse=True):
            print(f"  {filename:50s} {removed:3d} statements")
        print("-" * 70)
    else:
        print("\nNo console statements found in any files.")

    print(f"\n✓ All files processed successfully!")

if __name__ == "__main__":
    main()
