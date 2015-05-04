import json
import time
import sys


def progress_func(d):
    print(json.dumps(d))


def sum_(number):
    progress_func({"total": number})
    s = 0
    for i in range(number):
        progress_func({"progress": i})
        s += i
        time.sleep(0.01)
    progress_func({"result": s})

if __name__ == "__main__":
    sum_(int(sys.argv[1]))
