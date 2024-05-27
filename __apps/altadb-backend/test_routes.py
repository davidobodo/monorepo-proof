import unittest
from app import create_app

class RoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.app.testing = True

    def test_get_data(self):
        response = self.client.get('/api/data')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"data": "Here is some data from AltaDB Server"})


if __name__ == '__main__':
    unittest.main()