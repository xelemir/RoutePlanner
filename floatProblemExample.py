import numpy as np


x1 = np.longdouble("48.62116490000000368")
x2 = np.longdouble("48.66619320000000215")

print(x1)
print(x2)

array1 = np.zeros(1, dtype=np.longdouble)
array1[0] = x1
print(array1[0])

array2 = np.zeros(1, dtype=np.longdouble)
array2[0] = x2
print(array2[0])


"""
https://developer.apple.com/forums/thread/673482

ARM MacOS does not properly support the long double type.
Long double numbers are stored as double precision numbers.

This means precision is lost. However this works fine on Intel MacOS and Linux (which is the target system for this project).
"""