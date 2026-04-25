class DummyUser:
    def __init__(self):
        self.id = "test_user"

def get_current_user():
    return DummyUser()