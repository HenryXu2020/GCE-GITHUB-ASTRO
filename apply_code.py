#!/usr/bin/env python3
import os
import sys
import re

def extract_files(content):
    """解析 all-code.txt，返回 (文件名, 代码内容) 的列表"""
    files = []
    lines = content.splitlines()
    i = 0
    prefix = '## 文件：'
    while i < len(lines):
        line = lines[i]
        if line.startswith(prefix):
            # 提取文件名（去掉前缀，去除两端空格）
            filename = line[len(prefix):].strip()
            i += 1
            code_lines = []
            # 收集代码直到下一个 "## 文件：" 或文件结束
            while i < len(lines) and not lines[i].startswith(prefix):
                code_lines.append(lines[i])
                i += 1
            # 处理代码块标记（移除首尾的 ```）
            if code_lines and code_lines[0].strip().startswith('```'):
                code_lines = code_lines[1:]          # 去掉开头的 ```
            if code_lines and code_lines[-1].strip() == '```':
                code_lines = code_lines[:-1]         # 去掉结尾的 ```
            # 将代码行合并为字符串
            code = '\n'.join(code_lines)
            files.append((filename, code))
        else:
            i += 1
    return files

def main():
    if len(sys.argv) != 3:
        print("用法: python3 apply_code.py <目标根目录> <all-code.txt路径>")
        sys.exit(1)

    root_dir = sys.argv[1]
    txt_file = sys.argv[2]

    if not os.path.isdir(root_dir):
        print(f"错误: 目录 {root_dir} 不存在")
        sys.exit(1)

    with open(txt_file, 'r', encoding='utf-8') as f:
        content = f.read()

    files = extract_files(content)
    print(f"找到 {len(files)} 个文件")

    for filename, code in files:
        full_path = os.path.join(root_dir, filename)
        # 自动创建目录
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"已写入: {full_path}")

if __name__ == '__main__':
    main()
