<?php
    header('Content-Type:text/plain');
    $uname=$_REQUEST['uname'];
    $upwd=$_REQUEST['upwd'];
    $output=[];
    $conn=mysqli_connect('127.0.0.1','root','','Gobang',3306);
    mysqli_query($conn,'SET NAMES UTF8');
    $sql="SELECT uid FROM users WHERE name='$uname' AND pwd='$upwd'";
    $result=mysqli_query($conn,$sql);
    if(!$result){
        $output['msg']='fail';
        $output['reason']='SQL语句错误：'.$sql;
        return;
    }
    $row=mysqli_fetch_assoc($result);
    $output[]=$row;
    echo json_encode($output);