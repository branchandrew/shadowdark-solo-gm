#!/usr/bin/env python3

import random
import sys
import json

# Level 1: Evil
evil_start = ['Sk', 'Zu', 'Ve', 'Ul', 'Kr', 'Gr', 'Th', 'Dr', 'Bl', 'Sh', 'Vy', 'Ky', 'Ny', 'Py', 'Ry', 'Sy', 'Ty', 'Wy', 'Zy', 'Fy']
evil_middle = ['yu', 'sky', 'ly', 'pu', 'ye', 'ed', 'ud', 'sk', 'or', 'ar', 'ur', 'ir', 'er', 'ak', 'ok', 'uk', 'ik', 'ek', 'oz', 'az']
evil_end = ['d', 'e', 'k', 'sk', 'st', 'rl', 'th', 'nd', 'rk', 'sh', 'gr', 'bl', 'dr', 'kr', 'vd', 'yd', 'zd', 'fd', 'ld', 'md']

# Level 2: Slavic
slavic_start = ['Sv', 'Mir', 'Dus', 'Bor', 'Vlad', 'Kat', 'Nik', 'Olg', 'Pav', 'Rad', 'Yar', 'Zor', 'Lud', 'Mil', 'Nat', 'Ost', 'Pet', 'Rus', 'Stan', 'Tad']
slavic_middle = ['ya', 'ye', 'lo', 'va', 'mi', 'ro', 'sla', 'to', 'dra', 'ka', 'li', 'na', 'po', 'ra', 'si', 'ta', 'vi', 'za', 'bo', 'du']
slavic_end = ['ov', 'a', 'in', 'ka', 'la', 'mir', 'slav', 'yev', 'ich', 'ko', 'na', 'or', 'ski', 'va', 'yan', 'zin', 'dor', 'gar', 'len', 'nov']

# Level 3: Anglo-Saxon
anglo_start = ['Æth', 'Ead', 'Alf', 'Beo', 'Cyn', 'Dun', 'Edg', 'Fre', 'God', 'Her', 'Ing', 'Leo', 'Mund', 'Off', 'Red', 'Sig', 'Theod', 'Wig', 'Wulf', 'Ælf']
anglo_middle = ['win', 'mund', 'ric', 'stan', 'wald', 'frith', 'gar', 'helm', 'sige', 'weard', 'beald', 'cild', 'dred', 'ferth', 'gund', 'heard', 'laf', 'noth', 'ræd', 'swith']
anglo_end = ['red', 'gar', 'wulf', 'helm', 'sige', 'weard', 'beald', 'cild', 'dred', 'ferth', 'gund', 'heard', 'laf', 'noth', 'ræd', 'swith', 'bert', 'frid', 'mund', 'ric']

# Level 4: Fae/Elvish
elvish_start = ['El', 'Ar', 'Fin', 'Gal', 'Leg', 'Thran', 'Mir', 'Lor', 'Ae', 'Ce', 'Fe', 'Gla', 'Ha', 'Il', 'La', 'Ma', 'Na', 'Oro', 'Quen', 'Sil']
elvish_middle = ['en', 'ion', 'ad', 'or', 'el', 'ith', 'ael', 'aur', 'eor', 'ian', 'lor', 'mir', 'nor', 'ril', 'thar', 'uin', 'wen', 'yar', 'zir', 'dor']
elvish_end = ['dor', 'las', 'wen', 'ril', 'thar', 'ion', 'ael', 'aur', 'eor', 'ian', 'lor', 'mir', 'nor', 'del', 'fel', 'gil', 'hel', 'kel', 'mel', 'nel']

def generate_names(alignment=1, num_names=10):
    if alignment == 1:  # Evil
        start, middle, end = evil_start, evil_middle, evil_end
    elif alignment == 2:  # Slavic
        start, middle, end = slavic_start, slavic_middle, slavic_end
    elif alignment == 3:  # Anglo-Saxon
        start, middle, end = anglo_start, anglo_middle, anglo_end
    elif alignment == 4:  # Fae/Elvish
        start, middle, end = elvish_start, elvish_middle, elvish_end
    else:
        raise ValueError("Alignment must be between 1 and 4")
    
    names = []
    for _ in range(num_names):
        num_syllables = random.randint(2, 4)
        
        name = random.choice(start)
        for _ in range(num_syllables - 2):
            name += random.choice(middle)
        name += random.choice(end)
        
        names.append(name.capitalize())
    
    return names

def main():
    if len(sys.argv) != 3:
        print("Usage: python generate_name.py <alignment> <num_names>")
        print("Alignment: 1=Evil, 2=Slavic, 3=Anglo-Saxon, 4=Fae/Elvish")
        sys.exit(1)
    
    try:
        alignment = int(sys.argv[1])
        num_names = int(sys.argv[2])
        
        if alignment < 1 or alignment > 4:
            raise ValueError("Alignment must be between 1 and 4")
        
        if num_names < 1:
            raise ValueError("Number of names must be at least 1")
        
        names = generate_names(alignment, num_names)
        
        # Output as JSON for easy parsing
        result = {
            "success": True,
            "alignment": alignment,
            "names": names
        }
        
        print(json.dumps(result))
        
    except ValueError as e:
        result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(result))
        sys.exit(1)
    except Exception as e:
        result = {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main()
