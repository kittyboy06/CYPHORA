with open('M:/sympo/round3/src/App.tsx', 'rb') as f:
    content = f.read()

# Replace comment mojibake
bad_comment = b'\xc3\xa2\xe2\x80\xa2\xc2\x90\xc3\xa2\xe2\x80\xa2\xc2\x90\xc3\xa2\xe2\x80\xa2\xc2\x90'
good_comment = b'==='
content = content.replace(bad_comment, good_comment)

# Replace warning emoji mojibake
bad_warning = b'\xc3\xa2\xc5\xa1\xc2\xa0\xc3\xaf\xc2\xb8\xc2\x8f'
good_warning = b'\xe2\x9a\xa0\xef\xb8\x8f'
content = content.replace(bad_warning, good_warning)

# Replace em-dash mojibake just in case
bad_dash = b'\xc3\xa2\xe2\x82\xac\xe2\x80\x9c'
good_dash = b'\xe2\x80\x94'
content = content.replace(bad_dash, good_dash)

# Replace lock emoji mojibake
# The bytes printed were \xf0\x9f\x94\x92, but maybe it needs to be replaced?
# Actually, I'll just write it back to UTF-8
bad_lock_1 = b'\xc3\xb0\xc5\xb8\xe2\x80\x9d\xe2\x80\x99'
bad_lock_2 = b'\xf0\x9f\x94\x92' # Just in case it's actually correct but the prompt wants us to "replace" it, I'll just replace \xf0\x9f\x94\x92 with \xf0\x9f\x94\x92.
content = content.replace(b'\xc3\xb0\xc5\xb8\xe2\x80\x9d\xe2\x80\x99', b'\xf0\x9f\x94\x92')
# But let's check what the string ðŸ”’ encodes to in utf-8:
# ð (\xc3\xb0) Ÿ (\xc5\xb8) ” (\xe2\x80\x9d) ’ (\xe2\x80\x99)
# If the file has \xf0\x9f\x94\x92, it IS the lock emoji!
# I will just write the content back.

with open('M:/sympo/round3/src/App.tsx', 'wb') as f:
    f.write(content)
print("Bytes replaced!")
