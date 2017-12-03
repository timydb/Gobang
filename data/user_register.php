<?php
    header('Content-Type:text/json');
    $name=$_REQUEST['name'];
    $pwd=$_REQUEST['pwd'];
    $gender=$_REQUEST['gender'];
    $phone=$_REQUEST['phone'];
    $email=$_REQUEST['email'];
    $reg_time=time()*1000;
    $output=[];
    $conn=mysqli_connect('127.0.0.1','root','','Gobang',3306);
    mysqli_query($conn,'SET NAMES UTF8');
    $sql="INSERT INTO users VALUES(NULL,'$name','$pwd','$gender','$phone','$email','$reg_time')";
    $result=mysqli_query($conn,$sql);
    if($result){
        $output['msg']='succ';
        $output['id']=mysqli_insert_id($conn);
    }else{
        $output['msg']='fail';
        $output['reason']='SQL语句错误：'.$sql;
    }
    echo json_encode($output);