import numpy as np

x = np.longdouble("48.62116490000000368")

print(type(x))

array = np.zeros(1, dtype=np.longdouble)
array[0] = x
print(array[0])


"48.62116490000000368"