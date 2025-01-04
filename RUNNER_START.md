sudo apt update && sudo apt upgrade -y

# Pour Ubuntu
sudo apt install docker.io -y
sudo systemctl start docker
sudo usermod -aG docker $USER

sudo systemctl enable docker

curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install gitlab-runner -y

sudo gitlab-runner register

sudo nano /etc/gitlab-runner/config.toml

```
[[runners]]
  name = "ec2-runner"
  url = "https://gitlab.com/"
  token = "YOUR_TOKEN"
  executor = "docker"
  [runners.docker]
    tls_verify = false
    image = "node:18"
    privileged = true
    volumes = ["/cache"]
```

sudo gitlab-runner restart
