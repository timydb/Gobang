<?php
    header('Content-Type:text/plain');
    $name=$_REQUEST['name'];
    $conn=mysqli_connect('127.0.0.1','root','','Gobang',3306);
    mysqli_query($conn,'SET NAMES UTF8');
    $sql="SELECT uid FROM users WHERE name='$name'";
    $result=mysqli_query($conn,$sql);
    if($result){
        $row=mysqli_fetch_assoc($result);
        echo $row?'cunzai':'bucunzai';
    }else{
        echo 'SQL语句错误'.$sql;
    }