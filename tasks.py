import json
import time
import sys


class Progress:
    @staticmethod
    def __set_value(name, value):
        print(json.dumps({"name": name, "value": value}))

    @staticmethod
    def set_total(total):
        Progress.__set_value("total", total)

    @staticmethod
    def set_progress(progress):
        Progress.__set_value("progress", progress)

    @staticmethod
    def set_result(result):
        Progress.__set_value("result", result)


def sum_(number):
    Progress.set_total(number)
    s = 0
    for i in range(number):
        Progress.set_progress(i)
        s += i
        time.sleep(0.01)
    Progress.set_result(s)

if __name__ == "__main__":
    sum_(int(sys.argv[1]))
