# aws codepipeline
aws codepipeline

http://queirozf.com/entries/using-aws-codepipeline-to-automatically-build-and-deploy-your-app-stored-on-github-as-a-docker-based-beanstalk-application#part-2-setup-a-codepipeline-pipeline

### What you need:
 - aws eb cli
 - certificate manager (ssl and domain name)
 - ec2
 - aws elastic beanstalk
 - aws codePipeline

### How to build:
 - Install aws eb cli
 
   Windows: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install-windows.html
   
   Mac, linux: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html
   ```
   $ pip install awsebcli --upgrade --user
   ```

 - Create certificate in certificate manager
   - Request a public certificate
   - Type <your-domain-name>
   - Select DNS validation

 - aws elastic beanstalk
   ```
   $ cd <your-repo>
   $ eb init
   ```

   Get Access key ID and Secret access key
   
   https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html
   
   - Create access key
   - Download the csv file

   - Select ap-southeast-1 : Asia Pacific (Singapore)
   - Select an application to use: create new application

   If you use windows, you see this error:
   Your project is using git, but git doesn't appear to be installed. Have you added git to your PATH
   - Install git, and set git to your PATH

   - It appears you are using Docker. Is this correct?: yes
   - Select a platform version: latest one
   - Do you wish to continue with CodeCommit?: no
   - Do you want to set up SSH for your instances?: no

   ```
   $ eb create
   ```
   - Enter environment name: <your-environment-name>
   - Enter DNS CNAME prefix: press enter
   - Select classic load-balancer
   - Login to aws -> go to elasticbeanstalk -> click configuration -> Instances -> modify instance type to t2.small
   - Login to aws -> go to elasticbeanstalk -> click configuration -> Load balancer -> add listener -> set Listener port: 443, Listener protocol: HTTPS, Instance port: 80 Instance protocol: HTTP, and select certificate (ssl and domain name)

 - aws codepipeline
   ```
   How to create:
   Step 1: Pipeline name: <your-pipeline-name>
   Step 2: Pipeline settings:
   - Create new service role / Use existing service role
     - Create new service role: use the generated name
     - Use existing service role: select AWS-CodePipeline-Service
   - Artifact store
     - Select Default location
   Step 3: Source provider: Github -> connect to Github -> select your repo -> select master branch -> select Github webhooks
   Step 4: Build provider: No Build
   Step 5: Deployment provider: AWS elastic beanstalk -> Application name: <your-application-name> -> Environment name: <your-eb-create-environment-name>
   Step 6: Role name: AWS-CodePipeline-Service
   ```

1. Source
 - Connect to github repo
   output artifact: MyApp

2. Deploy
 - Deploy zip to aws elastic beanstalk
   input artifact: MyApp

Click release change button in aws codepipeline, it will use latest commit from your git repo to deploy
