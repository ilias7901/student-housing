import os

def replace_in_file(filepath, old_text, new_text):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old_text, new_text)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

files = ['index.html', 'landlord.html', 'app.js', 'auth.js', 'translations.js', 'style.css']
for file in files:
    replace_in_file(file, 'StudyNest', 'EtuLoc')
    replace_in_file(file, 'studynest.com', 'etuloc.com')
    replace_in_file(file, 'studynest', 'etuloc')

old_logo = '''<span class="logo-icon">🏠</span>
        <span class="logo-text">Etu<span class="logo-accent">Loc</span></span>'''
new_logo = '''<img src="images/logo.png" alt="EtuLoc Logo" class="logo-img">
        <span class="logo-text" style="color:#0b5edd;">Etu<span class="logo-accent" style="color:#ffb703;">Loc</span></span>'''

replace_in_file('index.html', old_logo, new_logo)
replace_in_file('landlord.html', old_logo, new_logo)

old_logo2 = '''<span class="logo-icon">🏠</span>\n        <span class="logo-text">Etu<span class="logo-accent">Loc</span></span>'''
replace_in_file('index.html', old_logo2, new_logo)
replace_in_file('landlord.html', old_logo2, new_logo)

with open('style.css', 'a', encoding='utf-8') as f:
    f.write('\n/* Logo Styles */\n.logo-img { height: 40px; width: auto; margin-right: 0.25rem; display: block; }\n')
