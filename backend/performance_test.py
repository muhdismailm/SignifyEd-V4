from locust import HttpUser, task, between

class SignifyEdUser(HttpUser):

    wait_time = between(1, 3)

    @task
    def test_text_translation(self):

        payload = {
            "text": "hello how are you"
        }

        self.client.post(
            "/process",
            json=payload
        )

    @task
    def test_seq2seq(self):

        payload = {
            "text": "good morning"
        }

        self.client.post(
            "/seq2seq_process",
            json=payload
        )